import * as React from "react";
import Downshift, { StateChangeOptions, DownshiftState } from "downshift";
import * as classNames from "classnames";

import "./ChapterAutocomplete.css";

import { Versification } from "@bible-reader/types";

import { bibleBookNames } from "../../lang/bibleBookNames.en";

interface ChapterAutocompleteProps {
  book: string;
  chapter: number;
  v11n: Versification;
  onChange: (book: string, chapter: number) => void;
}

interface ListItem {
  value: string | number;
  text: string;
  comparisonValue: string; // the value by which to compare with the input
}

enum SelectionType {
  BOOK,
  CHAPTER
}

interface ChapterAutocompleteState {
  beingSelected: SelectionType;
  selectedBook: string;
  selectedChapter: number;
  inputValue: string;
}

export default class ChapterAutocomplete extends React.Component<
  ChapterAutocompleteProps,
  ChapterAutocompleteState
> {
  constructor(props: ChapterAutocompleteProps) {
    super(props);
    this.state = {
      beingSelected: SelectionType.BOOK,
      selectedBook: props.book,
      selectedChapter: props.chapter,
      inputValue: ""
    };
  }

  onChange = (selectedItem: ListItem) => {
    if (this.state.beingSelected === SelectionType.BOOK) {
      // we only change mode from BOOK to CHAPTER and set book
      this.setState({
        beingSelected: SelectionType.CHAPTER,
        selectedBook: selectedItem.value.toString()
      });
    } else {
      // when chapter is selected, we also submit the result using onChange action
      const chapter = parseInt(selectedItem.value.toString(), 10);
      this.props.onChange(this.state.selectedBook, chapter);
    }
  };

  onInputValueChange = (inputValue: string) => {
    if (inputValue.indexOf(bibleBookNames[this.state.selectedBook]) !== 0) {
      this.setState(oldState => ({
        ...oldState,
        beingSelected: SelectionType.BOOK
      }));
    }
  };

  onBlur = () => {
    this.setState(oldState => ({
      beingSelected: SelectionType.CHAPTER,
      selectedBook: this.props.book,
      selectedChapter: this.props.chapter
    }));
  };

  changeBook = (bookId: string) => {
    this.setState(prevState => ({
      ...prevState,
      inputValue: bibleBookNames[bookId],
      selectedBook: bookId,
      beingSelected: SelectionType.CHAPTER
    }));
  };

  onDownshiftStateChange = (changes: StateChangeOptions) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.changeInput:
        this.onInputValueChange(changes.inputValue);
        break;
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.mouseUp:
      case Downshift.stateChangeTypes.keyDownEscape:
        this.onBlur();
        break;
      default:
    }
  };

  downshiftStateReducer = (
    state: DownshiftState,
    changes: StateChangeOptions
  ): StateChangeOptions => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.changeInput:
        this.setState({ inputValue: changes.inputValue });
        return {
          ...changes,
          highlightedIndex: 0
        };
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        this.setState({ inputValue: changes.inputValue });
        return {
          ...changes,
          isOpen: this.state.beingSelected === SelectionType.BOOK,
          highlightedIndex:
            this.state.beingSelected === SelectionType.BOOK
              ? 0
              : state.highlightedIndex || 0
        };
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.mouseUp:
      case Downshift.stateChangeTypes.keyDownEscape:
        return {
          ...changes,
          inputValue: `${bibleBookNames[this.props.book]} ${this.props.chapter}`
        };
      default:
        return changes;
    }
  };

  render() {
    const { v11n } = this.props;
    const { selectedBook, beingSelected } = this.state;

    let items: ListItem[];

    /**
     * The autocomplete shows either list of books or list of chapters depending on the current selection mode
     */
    if (beingSelected === SelectionType.CHAPTER) {
      const numberOfChapters = v11n[selectedBook].length;
      // e.g. items = [{ value: 1, text: "Genesis 1" }, { value: 2, text: "Genesis 2" }, ... ]
      items = Array.from(Array(numberOfChapters).keys()).map(chapterNumber => ({
        value: chapterNumber + 1,
        text: `${chapterNumber + 1}`,
        comparisonValue: `${bibleBookNames[selectedBook]} ${chapterNumber + 1}`
      }));
    } else {
      // e.g. items = [{ value: "gen", text: "Genesis" }, { value: "exo", text: "Exodus" }, ... ]
      items = Object.keys(v11n).map(value => ({
        value,
        text: bibleBookNames[value],
        comparisonValue: bibleBookNames[value]
      }));
    }

    return (
      <Downshift
        inputValue={this.state.inputValue}
        isOpen
        onStateChange={this.onDownshiftStateChange}
        stateReducer={this.downshiftStateReducer}
        onChange={this.onChange}
        itemToString={item => (item && item.text ? item.text : "")}
        render={({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          selectedItem,
          highlightedIndex
        }) => (
          <div className="ChapterAutocomplete">
            <input
              {...getInputProps({ placeholder: "Book" })}
              className="ChapterAutocomplete__input"
            />
            {beingSelected === SelectionType.CHAPTER && (
              <div className="ChapterAutocomplete__list">
                {Object.keys(v11n).map(bookId => (
                  <div
                    className={classNames("ChapterAutocomplete__list-item", {
                      "ChapterAutocomplete__list-item--active":
                        bookId === this.state.selectedBook
                    })}
                    key={bookId}
                    onClick={() => this.changeBook(bookId)}
                  >
                    {bibleBookNames[bookId]}
                  </div>
                ))}
              </div>
            )}
            <div className="ChapterAutocomplete__list">
              {items
                .filter(
                  item =>
                    !inputValue ||
                    item.comparisonValue
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                )
                .map((item, index) => (
                  <div
                    className={classNames("ChapterAutocomplete__list-item", {
                      "ChapterAutocomplete__list-item--hover":
                        highlightedIndex === index,
                      "ChapterAutocomplete__list-item--active":
                        item.text === bibleBookNames[this.props.book] ||
                        item.text === `${this.props.chapter}`
                    })}
                    {...getItemProps({ item })}
                    key={item.value}
                  >
                    {item.text}
                  </div>
                ))}
            </div>
            {beingSelected === SelectionType.BOOK && (
              <div className="ChapterAutocomplete__list">
                {Array.from(Array(v11n[this.props.book].length).keys()).map(
                  chapter => (
                    <div
                      onClick={() =>
                        this.props.onChange(
                          this.state.selectedBook,
                          chapter + 1
                        )
                      }
                      className={classNames("ChapterAutocomplete__list-item", {
                        "ChapterAutocomplete__list-item--active":
                          chapter + 1 === this.props.chapter
                      })}
                      key={`ch_${chapter + 1}`}
                    >
                      {chapter + 1}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      />
    );
  }
}
