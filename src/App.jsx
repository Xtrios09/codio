import React from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor";
import { Navbar, Nav, Modal, Button, Form } from "react-bootstrap";
import "./App.css";
import { Terminal } from "xterm";
import 'xterm/css/xterm.css';
import io from 'socket.io-client';
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "// type your code...",
      theme: "vs-dark",
      language: "javascript",
      snippets: [],
      showModal: false,
      newSnippet: '',
      fileName: 'untitled.js',
      terminalOutput: '',
      fontSize: 14,
      lineNumbers: true,
      showSettings: false,
      undoStack: [],
      redoStack: [],
      loading: true, // Add this line
    };

    // Connect to socket.io for real-time collaboration
    this.socket = io('http://localhost:4000'); // Ensure your server is running
  }

  componentDidMount() {

    monaco.editor.defineTheme('monokai', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '66d9ef', fontStyle: 'bold' },
          { token: 'number', foreground: 'f92672' },
          { token: 'string', foreground: 'e6db74' },
          { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
        ],
        colors: {
          'editor.background': '#272822',
          'editor.foreground': '#f8f8f2',
          'editorCursor.foreground': '#f8f8f0',
          'editor.lineHighlightBackground': '#3E3D32',
          'editorLineNumber.foreground': '#75715e',
        },
      });

    monaco.languages.registerCompletionItemProvider("javascript", {
      provideCompletionItems: this.getCompletionItems,
    });

    // Enable built-in IntelliSense features for JavaScript
    this.registerJavaScriptIntelliSense();

    this.socket.on('codeChange', (newCode) => {
      if (newCode !== this.state.code) {
        this.setState({ code: newCode });
      }
    });

    // Load saved snippets from local storage
    const savedSnippets = JSON.parse(localStorage.getItem('codeSnippets')) || [];
    this.setState({ snippets: savedSnippets, loading: false });
    
  }

  registerJavaScriptIntelliSense() {
    // Here you could set up additional IntelliSense configurations
    // Register hover providers, signature help providers, etc. if needed
  }

  getCompletionItems(model, position) {
    // Basic completion items
    const suggestions = [
        { label: "Array", kind: monaco.languages.CompletionItemKind.Class, insertText: "Array", detail: "Global object Array" },
        { label: "Boolean", kind: monaco.languages.CompletionItemKind.Class, insertText: "Boolean", detail: "Global object Boolean" },
        { label: "Date", kind: monaco.languages.CompletionItemKind.Class, insertText: "Date", detail: "Global object Date" },
        { label: "Error", kind: monaco.languages.CompletionItemKind.Class, insertText: "Error", detail: "Global object Error" },
        { label: "Function", kind: monaco.languages.CompletionItemKind.Class, insertText: "Function", detail: "Global object Function" },
        { label: "JSON", kind: monaco.languages.CompletionItemKind.Class, insertText: "JSON", detail: "Global object JSON" },
        { label: "Math", kind: monaco.languages.CompletionItemKind.Class, insertText: "Math", detail: "Global object Math" },
        { label: "Number", kind: monaco.languages.CompletionItemKind.Class, insertText: "Number", detail: "Global object Number" },
        { label: "Object", kind: monaco.languages.CompletionItemKind.Class, insertText: "Object", detail: "Global object Object" },
        { label: "RegExp", kind: monaco.languages.CompletionItemKind.Class, insertText: "RegExp", detail: "Global object RegExp" },
        { label: "String", kind: monaco.languages.CompletionItemKind.Class, insertText: "String", detail: "Global object String" },
        { label: "Set", kind: monaco.languages.CompletionItemKind.Class, insertText: "Set", detail: "Global object Set" },
        { label: "Map", kind: monaco.languages.CompletionItemKind.Class, insertText: "Map", detail: "Global object Map" },
        { label: "WeakSet", kind: monaco.languages.CompletionItemKind.Class, insertText: "WeakSet", detail: "Global object WeakSet" },
        { label: "WeakMap", kind: monaco.languages.CompletionItemKind.Class, insertText: "WeakMap", detail: "Global object WeakMap" },
        { label: "Promise", kind: monaco.languages.CompletionItemKind.Class, insertText: "Promise", detail: "Global object Promise" },
        { label: "Symbol", kind: monaco.languages.CompletionItemKind.Class, insertText: "Symbol", detail: "Global object Symbol" },
        { label: "console.log", kind: monaco.languages.CompletionItemKind.Function, insertText: "console.log", detail: "Logs output to the console" },
        { label: "console.error", kind: monaco.languages.CompletionItemKind.Function, insertText: "console.error", detail: "Logs error messages to the console" },
        { label: "console.warn", kind: monaco.languages.CompletionItemKind.Function, insertText: "console.warn", detail: "Logs warning messages to the console" },
        { label: "console.info", kind: monaco.languages.CompletionItemKind.Function, insertText: "console.info", detail: "Logs informational messages to the console" },
        { label: "alert", kind: monaco.languages.CompletionItemKind.Function, insertText: "alert", detail: "Displays an alert dialog" },
        { label: "confirm", kind: monaco.languages.CompletionItemKind.Function, insertText: "confirm", detail: "Displays a confirmation dialog" },
        { label: "prompt", kind: monaco.languages.CompletionItemKind.Function, insertText: "prompt", detail: "Displays a dialog for user input" },
        { label: "parseInt", kind: monaco.languages.CompletionItemKind.Function, insertText: "parseInt", detail: "Parses a string and returns an integer" },
        { label: "parseFloat", kind: monaco.languages.CompletionItemKind.Function, insertText: "parseFloat", detail: "Parses a string and returns a floating-point number" },
        { label: "isNaN", kind: monaco.languages.CompletionItemKind.Function, insertText: "isNaN", detail: "Determines whether a value is NaN" },
        { label: "isFinite", kind: monaco.languages.CompletionItemKind.Function, insertText: "isFinite", detail: "Determines whether a value is a finite number" },
        { label: "setTimeout", kind: monaco.languages.CompletionItemKind.Function, insertText: "setTimeout", detail: "Calls a function after a specified delay" },
        { label: "setInterval", kind: monaco.languages.CompletionItemKind.Function, insertText: "setInterval", detail: "Repeatedly calls a function at specified intervals" },
        { label: "clearTimeout", kind: monaco.languages.CompletionItemKind.Function, insertText: "clearTimeout", detail: "Cancels a timeout set by setTimeout" },
        { label: "clearInterval", kind: monaco.languages.CompletionItemKind.Function, insertText: "clearInterval", detail: "Cancels an interval set by setInterval" },
        { label: "fetch", kind: monaco.languages.CompletionItemKind.Function, insertText: "fetch", detail: "Makes a network request" },
        { label: "JSON.stringify", kind: monaco.languages.CompletionItemKind.Function, insertText: "JSON.stringify", detail: "Converts a JavaScript object to a JSON string" },
        { label: "JSON.parse", kind: monaco.languages.CompletionItemKind.Function, insertText: "JSON.parse", detail: "Parses a JSON string and returns a JavaScript object" },
        { label: "document.getElementById", kind: monaco.languages.CompletionItemKind.Function, insertText: "document.getElementById", detail: "Gets an element by its ID" },
        { label: "document.querySelector", kind: monaco.languages.CompletionItemKind.Function, insertText: "document.querySelector", detail: "Selects the first element that matches a CSS selector" },
        { label: "document.createElement", kind: monaco.languages.CompletionItemKind.Function, insertText: "document.createElement", detail: "Creates a new HTML element" },
        { label: "addEventListener", kind: monaco.languages.CompletionItemKind.Function, insertText: "addEventListener", detail: "Attaches an event handler to an element" },
        { label: "removeEventListener", kind: monaco.languages.CompletionItemKind.Function, insertText: "removeEventListener", detail: "Removes an event handler from an element" },
        { label: "setAttribute", kind: monaco.languages.CompletionItemKind.Function, insertText: "setAttribute", detail: "Sets the value of an attribute on an element" },
        { label: "getAttribute", kind: monaco.languages.CompletionItemKind.Function, insertText: "getAttribute", detail: "Gets the value of an attribute from an element" },
        { label: "innerHTML", kind: monaco.languages.CompletionItemKind.Property, insertText: "innerHTML", detail: "Sets or gets the HTML content of an element" },
        { label: "style", kind: monaco.languages.CompletionItemKind.Property, insertText: "style", detail: "Accesses the inline style of an element" },
        { label: "classList", kind: monaco.languages.CompletionItemKind.Property, insertText: "classList", detail: "Returns the class name(s) of an element" },
        { label: "push", kind: monaco.languages.CompletionItemKind.Method, insertText: "push", detail: "Adds one or more elements to the end of an array" },
        { label: "pop", kind: monaco.languages.CompletionItemKind.Method, insertText: "pop", detail: "Removes the last element from an array" },
        { label: "shift", kind: monaco.languages.CompletionItemKind.Method, insertText: "shift", detail: "Removes the first element from an array" },
        { label: "unshift", kind: monaco.languages.CompletionItemKind.Method, insertText: "unshift", detail: "Adds one or more elements to the beginning of an array" },
        { label: "slice", kind: monaco.languages.CompletionItemKind.Method, insertText: "slice", detail: "Extracts a section of an array and returns a new array" },
        { label: "splice", kind: monaco.languages.CompletionItemKind.Method, insertText: "splice", detail: "Changes the contents of an array by removing or replacing existing elements" },
        { label: "forEach", kind: monaco.languages.CompletionItemKind.Method, insertText: "forEach", detail: "Executes a provided function once for each array element" },
        { label: "map", kind: monaco.languages.CompletionItemKind.Method, insertText: "map", detail: "Creates a new array with the results of calling a provided function on every element" },
        { label: "filter", kind: monaco.languages.CompletionItemKind.Method, insertText: "filter", detail: "Creates a new array with all elements that pass the test implemented by the provided function" },
        { label: "reduce", kind: monaco.languages.CompletionItemKind.Method, insertText: "reduce", detail: "Executes a reducer function on each element of the array, resulting in a single output value" },
        { label: "find", kind: monaco.languages.CompletionItemKind.Method, insertText: "find", detail: "Returns the value of the first element in the array that satisfies the provided testing function" },
        { label: "some", kind: monaco.languages.CompletionItemKind.Method, insertText: "some", detail: "Tests whether at least one element in the array passes the test implemented by the provided function" },
        { label: "every", kind: monaco.languages.CompletionItemKind.Method, insertText: "every", detail: "Tests whether all elements in the array pass the test implemented by the provided function" },
        { label: "includes", kind: monaco.languages.CompletionItemKind.Method, insertText: "includes", detail: "Determines whether an array includes a certain value among its entries" },
        { label: "sort", kind: monaco.languages.CompletionItemKind.Method, insertText: "sort", detail: "Sorts the elements of an array in place and returns the sorted array" },
        { label: "reverse", kind: monaco.languages.CompletionItemKind.Method, insertText: "reverse", detail: "Reverses the elements of an array in place" },
        { label: "join", kind: monaco.languages.CompletionItemKind.Method, insertText: "join", detail: "Joins all elements of an array into a string" },
        { label: "toString", kind: monaco.languages.CompletionItemKind.Method, insertText: "toString", detail: "Returns a string representing the specified object" },
        { label: "slice", kind: monaco.languages.CompletionItemKind.Method, insertText: "slice", detail: "Returns a shallow copy of a portion of an array" },
        { label: "toFixed", kind: monaco.languages.CompletionItemKind.Method, insertText: "toFixed", detail: "Formats a number using fixed-point notation" },
        { label: "toUpperCase", kind: monaco.languages.CompletionItemKind.Method, insertText: "toUpperCase", detail: "Returns the calling string value converted to uppercase" },
        { label: "toLowerCase", kind: monaco.languages.CompletionItemKind.Method, insertText: "toLowerCase", detail: "Returns the calling string value converted to lowercase" },
        { label: "trim", kind: monaco.languages.CompletionItemKind.Method, insertText: "trim", detail: "Removes whitespace from both ends of a string" },
        { label: "split", kind: monaco.languages.CompletionItemKind.Method, insertText: "split", detail: "Splits a string into an array of substrings" },
        { label: "charAt", kind: monaco.languages.CompletionItemKind.Method, insertText: "charAt", detail: "Returns the character at the specified index" },
        { label: "indexOf", kind: monaco.languages.CompletionItemKind.Method, insertText: "indexOf", detail: "Returns the index of the first occurrence of a specified value" },
        { label: "lastIndexOf", kind: monaco.languages.CompletionItemKind.Method, insertText: "lastIndexOf", detail: "Returns the index of the last occurrence of a specified value" },
        { label: "startsWith", kind: monaco.languages.CompletionItemKind.Method, insertText: "startsWith", detail: "Determines whether a string starts with the characters of a specified string" },
        { label: "endsWith", kind: monaco.languages.CompletionItemKind.Method, insertText: "endsWith", detail: "Determines whether a string ends with the characters of a specified string" },
        { label: "match", kind: monaco.languages.CompletionItemKind.Method, insertText: "match", detail: "Retrieves the matches when matching a string against a regular expression" },
        { label: "replace", kind: monaco.languages.CompletionItemKind.Method, insertText: "replace", detail: "Returns a new string with some or all matches of a pattern replaced by a replacement" },
        { label: "setTimeout", kind: monaco.languages.CompletionItemKind.Function, insertText: "setTimeout", detail: "Calls a function after a specified number of milliseconds" },
        { label: "setInterval", kind: monaco.languages.CompletionItemKind.Function, insertText: "setInterval", detail: "Repeatedly calls a function at specified intervals" },
        { label: "clearTimeout", kind: monaco.languages.CompletionItemKind.Function, insertText: "clearTimeout", detail: "Cancels a timeout previously established by calling setTimeout" },
        { label: "clearInterval", kind: monaco.languages.CompletionItemKind.Function, insertText: "clearInterval", detail: "Cancels an interval previously established by calling setInterval" },
        { label: "requestAnimationFrame", kind: monaco.languages.CompletionItemKind.Function, insertText: "requestAnimationFrame", detail: "Schedules a function to be called before the next repaint" },
        { label: "cancelAnimationFrame", kind: monaco.languages.CompletionItemKind.Function, insertText: "cancelAnimationFrame", detail: "Cancels a scheduled animation frame request" },
        { label: "localStorage", kind: monaco.languages.CompletionItemKind.Variable, insertText: "localStorage", detail: "Accesses the local storage object" },
        { label: "sessionStorage", kind: monaco.languages.CompletionItemKind.Variable, insertText: "sessionStorage", detail: "Accesses the session storage object" },
        { label: "navigator", kind: monaco.languages.CompletionItemKind.Variable, insertText: "navigator", detail: "Provides information about the web browser" },
        { label: "window", kind: monaco.languages.CompletionItemKind.Variable, insertText: "window", detail: "Represents the window containing the DOM document" },
        { label: "document", kind: monaco.languages.CompletionItemKind.Variable, insertText: "document", detail: "Represents the DOM document" },
        { label: "history", kind: monaco.languages.CompletionItemKind.Variable, insertText: "history", detail: "Represents the browser session history" },
        { label: "fetch", kind: monaco.languages.CompletionItemKind.Function, insertText: "fetch", detail: "Starts the process of fetching a resource" },
        { label: "XMLHttpRequest", kind: monaco.languages.CompletionItemKind.Class, insertText: "XMLHttpRequest", detail: "Creates a new XMLHttpRequest object" },
        { label: "WebSocket", kind: monaco.languages.CompletionItemKind.Class, insertText: "WebSocket", detail: "Creates a new WebSocket object" },
        { label: "Event", kind: monaco.languages.CompletionItemKind.Class, insertText: "Event", detail: "Represents an event" },
        { label: "MouseEvent", kind: monaco.languages.CompletionItemKind.Class, insertText: "MouseEvent", detail: "Represents a mouse event" },
        { label: "KeyboardEvent", kind: monaco.languages.CompletionItemKind.Class, insertText: "KeyboardEvent", detail: "Represents a keyboard event" },
        { label: "TouchEvent", kind: monaco.languages.CompletionItemKind.Class, insertText: "TouchEvent", detail: "Represents a touch event" },
        { label: "DOMContentLoaded", kind: monaco.languages.CompletionItemKind.Event, insertText: "DOMContentLoaded", detail: "Fired when the initial HTML document has been completely loaded and parsed" },
        { label: "load", kind: monaco.languages.CompletionItemKind.Event, insertText: "load", detail: "Fired when the resource and its dependent resources have finished loading" },
        { label: "unload", kind: monaco.languages.CompletionItemKind.Event, insertText: "unload", detail: "Fired when the document or a resource is being unloaded" },
        { label: "click", kind: monaco.languages.CompletionItemKind.Event, insertText: "click", detail: "Fired when a pointing device button is pressed and released on an element" },
        { label: "change", kind: monaco.languages.CompletionItemKind.Event, insertText: "change", detail: "Fired when the value of an element has been changed" },
        { label: "input", kind: monaco.languages.CompletionItemKind.Event, insertText: "input", detail: "Fired when the value of an `<input>`, `<textarea>`, or `<select>` element has changed" },
        { label: "focus", kind: monaco.languages.CompletionItemKind.Event, insertText: "focus", detail: "Fired when an element has received focus" },
        { label: "blur", kind: monaco.languages.CompletionItemKind.Event, insertText: "blur", detail: "Fired when an element has lost focus" },
        { label: "submit", kind: monaco.languages.CompletionItemKind.Event, insertText: "submit", detail: "Fired when a form is submitted" },
        { label: "resize", kind: monaco.languages.CompletionItemKind.Event, insertText: "resize", detail: "Fired when the document view is resized" },
        { label: "scroll", kind: monaco.languages.CompletionItemKind.Event, insertText: "scroll", detail: "Fired when the document view is scrolled" },
        { label: "changeColor", kind: monaco.languages.CompletionItemKind.Function, insertText: "changeColor", detail: "Changes the color of an element" },
        { label: "toggleVisibility", kind: monaco.languages.CompletionItemKind.Function, insertText: "toggleVisibility", detail: "Toggles the visibility of an element" },
        { label: "initialize", kind: monaco.languages.CompletionItemKind.Function, insertText: "initialize", detail: "Initializes the application" },
        { label: "getUserData", kind: monaco.languages.CompletionItemKind.Function, insertText: "getUserData", detail: "Retrieves user data" },
        { label: "setUserData", kind: monaco.languages.CompletionItemKind.Function, insertText: "setUserData", detail: "Sets user data" },
        { label: "loadUserPreferences", kind: monaco.languages.CompletionItemKind.Function, insertText: "loadUserPreferences", detail: "Loads user preferences" },
        { label: "saveUserPreferences", kind: monaco.languages.CompletionItemKind.Function, insertText: "saveUserPreferences", detail: "Saves user preferences" },
        { label: "fetchData", kind: monaco.languages.CompletionItemKind.Function, insertText: "fetchData", detail: "Fetches data from an API" },
        { label: "submitForm", kind: monaco.languages.CompletionItemKind.Function, insertText: "submitForm", detail: "Submits a form" },
        { label: "resetForm", kind: monaco.languages.CompletionItemKind.Function, insertText: "resetForm", detail: "Resets a form" },
        { label: "validateInput", kind: monaco.languages.CompletionItemKind.Function, insertText: "validateInput", detail: "Validates user input" },
        { label: "getData", kind: monaco.languages.CompletionItemKind.Function, insertText: "getData", detail: "Gets data from a source" },
        { label: "processData", kind: monaco.languages.CompletionItemKind.Function, insertText: "processData", detail: "Processes data" },
        { label: "render", kind: monaco.languages.CompletionItemKind.Function, insertText: "render", detail: "Renders the UI" },
        { label: "updateUI", kind: monaco.languages.CompletionItemKind.Function, insertText: "updateUI", detail: "Updates the user interface" },
        { label: "toggleTheme", kind: monaco.languages.CompletionItemKind.Function, insertText: "toggleTheme", detail: "Toggles the application theme" },
        { label: "logError", kind: monaco.languages.CompletionItemKind.Function, insertText: "logError", detail: "Logs an error" },
        { label: "logInfo", kind: monaco.languages.CompletionItemKind.Function, insertText: "logInfo", detail: "Logs informational messages" },
        { label: "logWarning", kind: monaco.languages.CompletionItemKind.Function, insertText: "logWarning", detail: "Logs warning messages" },
        { label: "apiRequest", kind: monaco.languages.CompletionItemKind.Function, insertText: "apiRequest", detail: "Makes an API request" },
        { label: "apiResponse", kind: monaco.languages.CompletionItemKind.Function, insertText: "apiResponse", detail: "Handles API response" },
        { label: "calculateSum", kind: monaco.languages.CompletionItemKind.Function, insertText: "calculateSum", detail: "Calculates the sum of two numbers" },
        { label: "calculateAverage", kind: monaco.languages.CompletionItemKind.Function, insertText: "calculateAverage", detail: "Calculates the average of an array of numbers" },
        { label: "formatDate", kind: monaco.languages.CompletionItemKind.Function, insertText: "formatDate", detail: "Formats a date" },
        { label: "formatCurrency", kind: monaco.languages.CompletionItemKind.Function, insertText: "formatCurrency", detail: "Formats a number as currency" },
        { label: "debounce", kind: monaco.languages.CompletionItemKind.Function, insertText: "debounce", detail: "Creates a debounced function that delays invoking" },
        { label: "throttle", kind: monaco.languages.CompletionItemKind.Function, insertText: "throttle", detail: "Creates a throttled function that only invokes at specified intervals" },
        { label: "createObject", kind: monaco.languages.CompletionItemKind.Function, insertText: "createObject", detail: "Creates a new object" },
        { label: "mergeObjects", kind: monaco.languages.CompletionItemKind.Function, insertText: "mergeObjects", detail: "Merges two or more objects" },
        { label: "deepClone", kind: monaco.languages.CompletionItemKind.Function, insertText: "deepClone", detail: "Creates a deep clone of an object" },
        { label: "shallowClone", kind: monaco.languages.CompletionItemKind.Function, insertText: "shallowClone", detail: "Creates a shallow clone of an object" },
        { label: "capitalize", kind: monaco.languages.CompletionItemKind.Function, insertText: "capitalize", detail: "Capitalizes the first letter of a string" },
        { label: "randomNumber", kind: monaco.languages.CompletionItemKind.Function, insertText: "randomNumber", detail: "Generates a random number" },
        { label: "getRandomElement", kind: monaco.languages.CompletionItemKind.Function, insertText: "getRandomElement", detail: "Gets a random element from an array" },
        { label: "shuffleArray", kind: monaco.languages.CompletionItemKind.Function, insertText: "shuffleArray", detail: "Shuffles the elements of an array" },
        { label: "filterArray", kind: monaco.languages.CompletionItemKind.Function, insertText: "filterArray", detail: "Filters elements of an array based on a condition" },
        { label: "groupArrayBy", kind: monaco.languages.CompletionItemKind.Function, insertText: "groupArrayBy", detail: "Groups elements of an array by a specified key" },
        { label: "sortByKey", kind: monaco.languages.CompletionItemKind.Function, insertText: "sortByKey", detail: "Sorts an array of objects by a specified key" },
        { label: "fetchUserData", kind: monaco.languages.CompletionItemKind.Function, insertText: "fetchUserData", detail: "Fetches user data from an API" },
        { label: "saveUserData", kind: monaco.languages.CompletionItemKind.Function, insertText: "saveUserData", detail: "Saves user data to an API" },
        { label: "updateUserData", kind: monaco.languages.CompletionItemKind.Function, insertText: "updateUserData", detail: "Updates user data in an API" },
        { label: "deleteUserData", kind: monaco.languages.CompletionItemKind.Function, insertText: "deleteUserData", detail: "Deletes user data from an API" },
        { label: "createElement", kind: monaco.languages.CompletionItemKind.Function, insertText: "createElement", detail: "Creates a new HTML element" },
        { label: "appendChild", kind: monaco.languages.CompletionItemKind.Method, insertText: "appendChild", detail: "Adds a child node to an element" },
        { label: "removeChild", kind: monaco.languages.CompletionItemKind.Method, insertText: "removeChild", detail: "Removes a child node from an element" },
        { label: "replaceChild", kind: monaco.languages.CompletionItemKind.Method, insertText: "replaceChild", detail: "Replaces a child node within an element" },
        { label: "setStyle", kind: monaco.languages.CompletionItemKind.Function, insertText: "setStyle", detail: "Sets CSS styles on an element" },
        { label: "getComputedStyle", kind: monaco.languages.CompletionItemKind.Function, insertText: "getComputedStyle", detail: "Gets the computed style of an element" },
        { label: "toggleClass", kind: monaco.languages.CompletionItemKind.Function, insertText: "toggleClass", detail: "Toggles a class on an element" },
        { label: "addClass", kind: monaco.languages.CompletionItemKind.Function, insertText: "addClass", detail: "Adds a class to an element" },
        { label: "removeClass", kind: monaco.languages.CompletionItemKind.Function, insertText: "removeClass", detail: "Removes a class from an element" },
        { label: "filter", kind: monaco.languages.CompletionItemKind.Method, insertText: "filter", detail: "Creates a new array with all elements that pass the test implemented by the provided function" },
        { label: "map", kind: monaco.languages.CompletionItemKind.Method, insertText: "map", detail: "Creates a new array populated with the results of calling a provided function on every element in the calling array" },
        { label: "flat", kind: monaco.languages.CompletionItemKind.Method, insertText: "flat", detail: "Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth" },
        { label: "flatMap", kind: monaco.languages.CompletionItemKind.Method, insertText: "flatMap", detail: "Maps each element using a mapping function, then flattens the result into a new array" },
        { label: "fill", kind: monaco.languages.CompletionItemKind.Method, insertText: "fill", detail: "Fills all the elements of an array from a start index to an end index with a static value" },
        { label: "copyWithin", kind: monaco.languages.CompletionItemKind.Method, insertText: "copyWithin", detail: "Shallow copies part of an array to another location in the same array and returns it" },
        { label: "concat", kind: monaco.languages.CompletionItemKind.Method, insertText: "concat", detail: "Merges two or more arrays and returns a new array" },
        { label: "every", kind: monaco.languages.CompletionItemKind.Method, insertText: "every", detail: "Tests whether all elements in the array pass the test implemented by the provided function" },
        { label: "some", kind: monaco.languages.CompletionItemKind.Method, insertText: "some", detail: "Tests whether at least one element in the array passes the test implemented by the provided function" },
        { label: "keys", kind: monaco.languages.CompletionItemKind.Method, insertText: "keys", detail: "Returns a new array iterator object that contains the keys for each index in the array" },
        { label: "values", kind: monaco.languages.CompletionItemKind.Method, insertText: "values", detail: "Returns a new array iterator object that contains the values for each index in the array" },
        { label: "entries", kind: monaco.languages.CompletionItemKind.Method, insertText: "entries", detail: "Returns a new array iterator object that contains the key/value pairs for each index in the array" },
        { label: "pop", kind: monaco.languages.CompletionItemKind.Method, insertText: "pop", detail: "Removes the last element from an array and returns that element" },
        { label: "push", kind: monaco.languages.CompletionItemKind.Method, insertText: "push", detail: "Adds one or more elements to the end of an array and returns the new length of the array" },
        { label: "shift", kind: monaco.languages.CompletionItemKind.Method, insertText: "shift", detail: "Removes the first element from an array and returns that removed element" },
        { label: "unshift", kind: monaco.languages.CompletionItemKind.Method, insertText: "unshift", detail: "Adds one or more elements to the beginning of an array and returns the new length of the array" },
        { label: "forEach", kind: monaco.languages.CompletionItemKind.Method, insertText: "forEach", detail: "Executes a provided function once for each array element" },
        { label: "ArrayBuffer", kind: monaco.languages.CompletionItemKind.Class, insertText: "ArrayBuffer", detail: "Used to represent a generic, fixed-length raw binary data buffer" },
        { label: "Uint8Array", kind: monaco.languages.CompletionItemKind.Class, insertText: "Uint8Array", detail: "An array of 8-bit unsigned integers" },
        { label: "Float32Array", kind: monaco.languages.CompletionItemKind.Class, insertText: "Float32Array", detail: "An array of 32-bit floating point numbers" },
        { label: "Promise", kind: monaco.languages.CompletionItemKind.Class, insertText: "Promise", detail: "Represents the eventual completion (or failure) of an asynchronous operation and its resulting value" },
        { label: "async", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "async", detail: "Declares an asynchronous function" },
        { label: "await", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "await", detail: "Pauses the execution of an async function until a Promise is resolved" },
        { label: "set", kind: monaco.languages.CompletionItemKind.Class, insertText: "Set", detail: "A collection of values where each value must be unique" },
        { label: "map", kind: monaco.languages.CompletionItemKind.Class, insertText: "Map", detail: "A collection of keyed data items, similar to an object" },
        { label: "WeakSet", kind: monaco.languages.CompletionItemKind.Class, insertText: "WeakSet", detail: "A collection of objects, where the references to the objects are weak" },
        { label: "WeakMap", kind: monaco.languages.CompletionItemKind.Class, insertText: "WeakMap", detail: "A collection of key/value pairs where the keys are objects and the values can be any arbitrary value" },
        { label: "Reflect", kind: monaco.languages.CompletionItemKind.Object, insertText: "Reflect", detail: "Provides methods for interceptable JavaScript operations" },
        { label: "Object.assign", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.assign", detail: "Copies all enumerable own properties from one or more source objects to a target object" },
        { label: "Object.keys", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.keys", detail: "Returns an array of a given object's own enumerable property names" },
        { label: "Object.values", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.values", detail: "Returns an array of a given object's own enumerable property values" },
        { label: "Object.entries", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.entries", detail: "Returns an array of a given object's own enumerable property [key, value] pairs" },
        { label: "Object.freeze", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.freeze", detail: "Freezes an object, preventing new properties from being added to it" },
        { label: "Object.seal", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.seal", detail: "Seals an object, preventing new properties from being added and marking all existing properties as non-configurable" },
        { label: "Object.create", kind: monaco.languages.CompletionItemKind.Method, insertText: "Object.create", detail: "Creates a new object with the specified prototype object and properties" },
        { label: "Math.random", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.random", detail: "Returns a pseudorandom number between 0 and 1" },
        { label: "Math.floor", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.floor", detail: "Returns the largest integer less than or equal to a given number" },
        { label: "Math.ceil", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.ceil", detail: "Returns the smallest integer greater than or equal to a given number" },
        { label: "Math.round", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.round", detail: "Returns the value of a number rounded to the nearest integer" },
        { label: "Math.max", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.max", detail: "Returns the largest of the zero or more numbers given as input" },
        { label: "Math.min", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.min", detail: "Returns the smallest of the zero or more numbers given as input" },
        { label: "Math.abs", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.abs", detail: "Returns the absolute value of a number" },
        { label: "Math.sqrt", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.sqrt", detail: "Returns the square root of a number" },
        { label: "Math.pow", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.pow", detail: "Returns the base to the exponent power" },
        { label: "Math.sin", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.sin", detail: "Returns the sine of a number" },
        { label: "Math.cos", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.cos", detail: "Returns the cosine of a number" },
        { label: "Math.tan", kind: monaco.languages.CompletionItemKind.Method, insertText: "Math.tan", detail: "Returns the tangent of a number" },
        { label: "Math.randomInt", kind: monaco.languages.CompletionItemKind.Function, insertText: "randomInt", detail: "Generates a random integer between two values" },
        { label: "Math.randomFloat", kind: monaco.languages.CompletionItemKind.Function, insertText: "randomFloat", detail: "Generates a random floating-point number between two values" },
        { label: "isNaN", kind: monaco.languages.CompletionItemKind.Function, insertText: "isNaN", detail: "Determines whether a value is NaN" },
        { label: "isFinite", kind: monaco.languages.CompletionItemKind.Function, insertText: "isFinite", detail: "Determines whether a value is a finite, legal number" },
        { label: "parseInt", kind: monaco.languages.CompletionItemKind.Function, insertText: "parseInt", detail: "Parses a string argument and returns an integer of the specified radix" },
        { label: "parseFloat", kind: monaco.languages.CompletionItemKind.Function, insertText: "parseFloat", detail: "Parses a string argument and returns a floating-point number" },
        { label: "setTimeout", kind: monaco.languages.CompletionItemKind.Function, insertText: "setTimeout", detail: "Calls a function or evaluates an expression after a specified number of milliseconds" },
        { label: "clearTimeout", kind: monaco.languages.CompletionItemKind.Function, insertText: "clearTimeout", detail: "Cancels a timeout previously established by calling setTimeout" },
        { label: "setInterval", kind: monaco.languages.CompletionItemKind.Function, insertText: "setInterval", detail: "Repeatedly calls a function or executes an expression with a fixed time delay between each call" },
        { label: "clearInterval", kind: monaco.languages.CompletionItemKind.Function, insertText: "clearInterval", detail: "Cancels a timeout set by setInterval" },
        { label: "localStorage", kind: monaco.languages.CompletionItemKind.Object, insertText: "localStorage", detail: "Provides access to a storage object that can store key/value pairs in a web browser" },
        { label: "sessionStorage", kind: monaco.languages.CompletionItemKind.Object, insertText: "sessionStorage", detail: "Provides access to a storage object that is similar to localStorage but only lasts for the duration of the page session" },
        { label: "fetch", kind: monaco.languages.CompletionItemKind.Function, insertText: "fetch", detail: "Starts the process of fetching a resource from the network" },
        { label: "Response", kind: monaco.languages.CompletionItemKind.Class, insertText: "Response", detail: "Represents the response to a request" },
        { label: "Request", kind: monaco.languages.CompletionItemKind.Class, insertText: "Request", detail: "Represents a request to a resource" },
        { label: "AbortController", kind: monaco.languages.CompletionItemKind.Class, insertText: "AbortController", detail: "Allows you to abort one or more DOM requests as and when desired" },
        { label: "DOMException", kind: monaco.languages.CompletionItemKind.Class, insertText: "DOMException", detail: "Represents an error that occurs when a DOM operation fails" },
        { label: "console.log", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.log", detail: "Outputs a message to the web console" },
        { label: "console.error", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.error", detail: "Outputs an error message to the web console" },
        { label: "console.warn", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.warn", detail: "Outputs a warning message to the web console" },
        { label: "console.info", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.info", detail: "Outputs an informational message to the web console" },
        { label: "console.table", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.table", detail: "Displays tabular data as a table" },
        { label: "console.assert", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.assert", detail: "Writes an error message to the console if the assertion is false" },
        { label: "console.time", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.time", detail: "Starts a timer that can be stopped with console.timeEnd()" },
        { label: "console.timeEnd", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.timeEnd", detail: "Stops the timer started by console.time()" },
        { label: "console.group", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.group", detail: "Creates a new inline group in the console" },
        { label: "console.groupEnd", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.groupEnd", detail: "Exits the current inline group in the console" },
        { label: "console.trace", kind: monaco.languages.CompletionItemKind.Method, insertText: "console.trace", detail: "Outputs a stack trace to the console" },
        { label: "def", kind: monaco.languages.CompletionItemKind.Function, insertText: "def ", detail: "Define a function" },
            { label: "import", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "import ", detail: "Import a module" },
            { label: "print", kind: monaco.languages.CompletionItemKind.Function, insertText: "print(", detail: "Print to the console" },
            { label: "for", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "for ", detail: "For loop" },
            { label: "if", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "if ", detail: "If statement" },
            { label: "else", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "else:", detail: "Else statement" },
            { label: "while", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "while ", detail: "While loop" },
            { label: "class", kind: monaco.languages.CompletionItemKind.Class, insertText: "class ", detail: "Define a class" },

            // HTML suggestions
            { label: "<div>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<div></div>", detail: "Div element" },
            { label: "<span>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<span></span>", detail: "Span element" },
            { label: "<a>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<a href=\"\"></a>", detail: "Anchor element" },
            { label: "<p>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<p></p>", detail: "Paragraph element" },
            { label: "<img>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<img src=\"\" alt=\"\" />", detail: "Image element" },
            { label: "<ul>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<ul></ul>", detail: "Unordered list" },
            { label: "<ol>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<ol></ol>", detail: "Ordered list" },
            { label: "<li>", kind: monaco.languages.CompletionItemKind.Function, insertText: "<li></li>", detail: "List item" },

            // CSS suggestions
            { label: "color", kind: monaco.languages.CompletionItemKind.Property, insertText: "color: ;", detail: "Text color" },
            { label: "background-color", kind: monaco.languages.CompletionItemKind.Property, insertText: "background-color: ;", detail: "Background color" },
            { label: "font-size", kind: monaco.languages.CompletionItemKind.Property, insertText: "font-size: ;", detail: "Font size" },
            { label: "margin", kind: monaco.languages.CompletionItemKind.Property, insertText: "margin: ;", detail: "Margin" },
            { label: "padding", kind: monaco.languages.CompletionItemKind.Property, insertText: "padding: ;", detail: "Padding" },
            { label: "border", kind: monaco.languages.CompletionItemKind.Property, insertText: "border: ;", detail: "Border" },
            { label: "display", kind: monaco.languages.CompletionItemKind.Property, insertText: "display: ;", detail: "Display" },

            // TypeScript suggestions
            { label: "interface", kind: monaco.languages.CompletionItemKind.Interface, insertText: "interface ", detail: "Define an interface" },
            { label: "type", kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: "type ", detail: "Define a type alias" },
            { label: "const", kind: monaco.languages.CompletionItemKind.Variable, insertText: "const ", detail: "Define a constant" },
            { label: "let", kind: monaco.languages.CompletionItemKind.Variable, insertText: "let ", detail: "Define a variable" },
            { label: "function", kind: monaco.languages.CompletionItemKind.Function, insertText: "function ", detail: "Define a function" },
            { label: "async", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "async ", detail: "Define an async function" },
            { label: "await", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "await ", detail: "Await a promise" },
            { label: "return", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "return ", detail: "Return a value" },
        
    ];
    

    return { suggestions };
  }

  editorDidMount = (editor, monaco) => {
    editor.onDidChangeModelContent(() => {
      const currentCode = editor.getValue();
      this.socket.emit('codeChange', currentCode);
      this.updateUndoRedoStacks(currentCode);
    });
  }

  updateUndoRedoStacks(currentCode) {
    const { undoStack } = this.state;
    this.setState({ undoStack: [...undoStack, currentCode], redoStack: [] });
  }

  onChange = (newValue, e) => {
    this.setState({ code: newValue });
  };

//   handleThemeChange = (theme) => {
//     this.setState({ theme });
//   };
    handleThemeChange = (theme) => {
    if (theme === 'monokai') {
        monaco.editor.setTheme('monokai');
    } else {
        monaco.editor.setTheme(theme);
    }
    this.setState({ theme });
};

  handleLanguageChange = (language) => {
    this.setState({ language });
  };

  handleSaveCode = () => {
    const { code, fileName } = this.state;
    const blob = new Blob([code], { type: 'text/javascript' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, newSnippet: '' });
  };

  handleAddSnippet = () => {
    const { snippets, newSnippet } = this.state;
    const updatedSnippets = [...snippets, newSnippet];
    this.setState({ snippets: updatedSnippets, showModal: false });
    localStorage.setItem('codeSnippets', JSON.stringify(updatedSnippets));
  };

  handleRunCode = () => {
    fetch('/api/run-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: this.state.code }),
    })
    .then(response => response.text())
    .then(output => {
      this.setState({ terminalOutput: output });
    })
    .catch(err => console.error(err));
  };

  handleFontSizeChange = (e) => {
    this.setState({ fontSize: parseInt(e.target.value) });
  };

  toggleLineNumbers = () => {
    this.setState((prevState) => ({ lineNumbers: !prevState.lineNumbers }));
  };

  formatCode = () => {
    const { code } = this.state;
    const formatted = prettier.format(code, {
      parser: "babel",
      plugins: [parserBabel],
    });
    this.setState({ code: formatted });
  };

  undo = () => {
    const { undoStack } = this.state;
    if (undoStack.length > 1) {
      const newStack = undoStack.slice(0, -1);
      this.setState({ 
        undoStack: newStack,
        code: newStack[newStack.length - 1],
        redoStack: [...this.state.redoStack, undoStack[undoStack.length - 1]]
      });
    }
  };

  redo = () => {
    const { redoStack } = this.state;
    if (redoStack.length > 0) {
      const lastRedo = redoStack[redoStack.length - 1];
      this.setState(prevState => ({
        code: lastRedo,
        undoStack: [...prevState.undoStack, lastRedo],
        redoStack: redoStack.slice(0, -1),
      }));
    }
  };

  render() {
    const { code, theme, language, showModal, terminalOutput, fontSize, lineNumbers, loading} = this.state;

    // if (loading) {
    //     return <LoadingSpinner />; // Show the loading spinner if loading
    //   }

    const options = {
      selectOnLineNumbers: true,
      automaticLayout: true,
      fontSize: fontSize,
      lineNumbers: lineNumbers ? "on" : "off",
    };

    return (
      <>
        <Navbar bg="dark" variant="dark" expand="lg" className="bg-purple-950" padding="10px">
          <Navbar.Brand>Editor</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link onClick={() => this.handleThemeChange("vs")}>Light Theme</Nav.Link>
              <Nav.Link onClick={() => this.handleThemeChange("vs-dark")}>Dark Theme</Nav.Link>
              <Nav.Link onClick={() => this.handleThemeChange("monokai")}>Monokai</Nav.Link>
              <Nav.Link onClick={() => this.handleLanguageChange("javascript")}>JavaScript</Nav.Link>
              <Nav.Link onClick={() => this.handleLanguageChange("typescript")}>TypeScript</Nav.Link>
              <Nav.Link onClick={() => this.handleLanguageChange("python")}>Python</Nav.Link>
              <Nav.Link onClick={() => this.handleLanguageChange("html")}>HTML</Nav.Link>
              <Nav.Link onClick={() => this.handleLanguageChange("css")}>CSS</Nav.Link>
              <Nav.Link onClick={this.handleSaveCode}>Save Code</Nav.Link>
              <Nav.Link onClick={this.handleOpenModal}>Add Snippet</Nav.Link>
              <Nav.Link onClick={this.handleRunCode}>Run Code</Nav.Link>
              <Nav.Link onClick={this.formatCode}>Format Code</Nav.Link>
              <Nav.Link onClick={this.undo}>Undo</Nav.Link>
              <Nav.Link onClick={this.redo}>Redo</Nav.Link>
              <Nav.Link onClick={() => this.setState({ showSettings: true })}>Settings</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <MonacoEditor
            width="100%"
            height="57rem"
            language={language}
            theme={theme}
            value={code}
            options={options}
            onChange={this.onChange}
            editorDidMount={this.editorDidMount}
          />
          <div id="terminal-container" style={{ height: '400px', backgroundColor: '#1e1e1e', color: '#ffffff', padding: '10px' }}>
            <h5>Terminal Output:</h5>
            <pre>{terminalOutput}</pre>
          </div>
        </div>

        {/* Modal for Adding Snippets */}
        <Modal show={showModal} onHide={this.handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Code Snippet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <textarea
              rows="4"
              style={{ width: '100%' }}
              placeholder="Enter your snippet here..."
              onChange={(e) => this.setState({ newSnippet: e.target.value })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleAddSnippet}>
              Add Snippet
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Settings Modal */}
        <Modal show={this.state.showSettings} onHide={() => this.setState({ showSettings: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Editor Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formFontSize">
                <Form.Label>Font Size</Form.Label>
                <Form.Control 
                  type="number" 
                  value={fontSize} 
                  onChange={this.handleFontSizeChange}
                />
              </Form.Group>
              <Form.Group controlId="formLineNumbers">
                <Form.Check 
                  type="checkbox" 
                  label="Show Line Numbers" 
                  checked={lineNumbers} 
                  onChange={this.toggleLineNumbers}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({ showSettings: false })}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.setState({ showSettings: false })}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default MyEditor;
