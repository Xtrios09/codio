import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import { Navbar, Nav } from 'react-bootstrap';
import './App.css';
import MyComponent from './Components/Editor';
import MyTerminalComponent from './Components/Terminal';
// import FileTree from 'react-file-tree';

class MyEditor extends React.Component {
  componentDidMount() {
    monaco.languages.registerCompletionItemProvider('yourLanguageId', {
      provideCompletionItems: function (model, position) {
        return {
          suggestions: [
            {
              label: 'console',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'console',
              detail: 'Global object console',
            },
            {
              label: 'setTimeout',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'setTimeout',
              detail: 'Global function setTimeout',
            },
            {
              label: 'setInterval',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'setInterval',
              detail: 'Global function setInterval',
            },
            {
              label: 'fetch',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'fetch',
              detail: 'Global function fetch',
            },
            {
              label: 'addEventListener',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'addEventListener',
              detail: 'Method to add an event listener',
            },
          ]
        }
      }
    }
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      code: '// type your code...',
      theme: 'vs-dark',
      language: 'javascript'
    }
  }

  /**
   * editorDidMount function is called when the editor has been mounted.
   *
   * @param {editor} editor - the editor object
   * @param {monaco} monaco - the monaco object
   * @return {undefined} 
   */
  editorDidMount(editor, monaco) {
    console.log('editor', editor);
    console.log('monaco', monaco);
  }

  /**
   * onChange function for handling value change.
   *
   * @param {type} newValue - description of parameter
   * @param {type} e - description of parameter
   * @return {type} description of return value
   */
  onChange(newValue, e) {
    console.log('onChange', newValue, e);
    this.setState({ code: newValue });
  }

  handleThemeChange = (theme) => {
    this.setState({ theme });
  }

  handleLanguageChange = (language) => {
    this.setState({ language });
  }

  handleSaveCode = () => {
    // Add your code-saving logic here
    console.log('Code saved:', this.state.code);
  }

  render() {
    const { code, theme, language } = this.state;
    const options = {
      selectOnLineNumbers: true,
      suggest: {
        showWords: true,
        words: ['console', 'log', 'warn', 'error', 'info']
      }
    };
    return (
      <>
        <div>
          <Navbar bg="dark" variant='dark' expand="lg" style={{ color: 'white', padding: '1rem' }} >
            <Navbar.Brand>Editor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link onClick={() => this.handleThemeChange('vs')}>Light Theme</Nav.Link>
                <Nav.Link onClick={() => this.handleThemeChange('vs-dark')}>Dark Theme</Nav.Link>
                <Nav.Link onClick={() => this.handleLanguageChange('javascript')}>JavaScript</Nav.Link>
                <Nav.Link onClick={() => this.handleLanguageChange('typescript')}>TypeScript</Nav.Link>
                <Nav.Link onClick={() => this.handleLanguageChange('python')}>Python</Nav.Link>
                <Nav.Link onClick={this.handleSaveCode}>Save Code</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <div style={{ display: 'flex' }}>
            {/* <MyComponent /> */}
            {/* <FileTree
              data={this.props.data}
              onFileClick={this.props.onFileClick}
              onFileRename={this.props.onFileRename}
              /> */}
            <MonacoEditor
              autoDetectHighContrast:true
              wordBasedSuggestions:on
              wordBasedSuggestionsOnlySameLanguage:true
              stablePeek:true
              width="100%"
              height="55rem"
              language={language}
              theme={theme}
              value={code}
              options={options}
              onChange={this.onChange}
              editorDidMount={this.editorDidMount}
              expand="lg"
            />
            {/* <Bash /> */}

          </div>
        </div>
      </>
    );
  }
}

export default MyEditor;