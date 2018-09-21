import * as React from "react";

import ChapterAutocomplete from "../ChapterAutocomplete";
import "./ChapterSelect.css";

import { Versification } from "@bible-reader/types";

import { bibleBookNames } from "../../lang/bibleBookNames.en";
import { Loader } from "../Loader";

interface ChapterSelectProps {
  book: string;
  chapter: number;
  v11n: Versification;
  onChange: (book: string, chapter: number) => void;
  loading: boolean;
}

interface ChapterSelectState {
  open: boolean;
  wasTouched: boolean;
}

export default class ChapterSelect extends React.Component<
  ChapterSelectProps,
  ChapterSelectState
> {
  state: ChapterSelectState = {
    open: false,
    wasTouched: false
  };
  wrapperRef: HTMLDivElement;
  buttonRef: HTMLDivElement;

  handleButtonClick = () => {
    this.setState(oldState => ({ ...oldState, open: !oldState.open }));
  };

  handleOnTouchEnd = () => {
    this.setState({ wasTouched: true });
  };

  handleClose = () => {
    this.setState(oldState => ({ ...oldState, open: false }));
  };

  handleChange = (book: string, chapter: number) => {
    this.handleClose();
    this.props.onChange(book, chapter);
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside as (
      e: {}
    ) => void);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside as (
      e: {}
    ) => void);
  }

  setWrapperRef = (node: HTMLDivElement) => {
    this.wrapperRef = node;
  };

  setButtonRef = (node: HTMLDivElement) => {
    this.buttonRef = node;
  };

  handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target as HTMLElement) &&
      !this.buttonRef.contains(event.target as HTMLElement)
    ) {
      this.handleClose();
    }
  };

  render() {
    const { book, chapter, v11n } = this.props;
    return (
      <div className="ChapterSelect">
        <div
          className="ChapterSelect_handle"
          onClick={this.handleButtonClick}
          onTouchEnd={this.handleOnTouchEnd}
          ref={this.setButtonRef}
        >
          {`${bibleBookNames[this.props.book]} ${this.props.chapter}`}
        </div>
        {this.state.open && (
          <div className="ChapterSelect_dropdown" ref={this.setWrapperRef}>
            <ChapterAutocomplete
              book={book}
              chapter={chapter}
              v11n={v11n}
              onChange={this.handleChange}
              onCancel={this.handleClose}
              touchEnabled={this.state.wasTouched}
            />
          </div>
        )}
        {this.props.loading && <Loader />}
      </div>
    );
  }
}
