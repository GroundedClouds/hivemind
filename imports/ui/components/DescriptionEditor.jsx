import Draft, {Editor, EditorState, ContentState} from 'draft-js';
import Immutable from 'immutable';
import Lodash from 'lodash';
import React from 'react';

export default class DescriptionEditor extends React.Component {
  constructor(props) {
    super(props);
    const editorState = EditorState.createWithContent(this.rawContentStateToContentState(props.value));
    this.state = {editorState};
    this.onFocus = () => this.refs.editor.focus();

    this.propagateChange = Lodash.debounce(() => {
      const rawContentState = Draft.convertToRaw(this.state.editorState.getCurrentContent());
      this.props.onChange(rawContentState)
    }, 300);

    this.onChange = (editorState) => {
      this.setState({editorState});
      this.propagateChange();
    };

    this.handleKeyCommand = (command) => {
      const newEditorState = Draft.RichUtils.handleKeyCommand(this.state.editorState, command);
      if (newEditorState) {
        this.onChange(newEditorState);
        return true;
      } else {
        return false;
      }
    }
  }

  rawContentStateToContentState(rawContentState) {
    if (rawContentState) {
      const contentBlocks = Draft.convertFromRaw(rawContentState);
      return ContentState.createFromBlockArray(contentBlocks);
    } else {
      return ContentState.createFromText("");
    }
  }

  componentWillReceiveProps(nextProps) {
    const newContentState = this.rawContentStateToContentState(nextProps.value);
    const {editorState} = this.state;
    if (
      !editorState.getSelection().hasFocus &&
      !Immutable.is(newContentState.getBlockMap(), editorState.getCurrentContent().getBlockMap()))
    {
      this.setState({editorState: EditorState.push(editorState, newContentState)});
    }
  }

  render() {
    return (
      <div onClick={this.onFocus} className="descriptionEditor">
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          handleKeyCommand={this.handleKeyCommand}
          placeholder="Notes, quotes, takeaways…"
          ref="editor"
          readOnly={this.props.disabled}
        />
      </div>
    );
  }
}
