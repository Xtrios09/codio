import React from 'react';
import { Bash } from 'react-bash';

const MyTerminalComponent = () => {
  return (
    <Bash
      prefix="user@my-website:~$"
      structure={{
        '/': {
          contents: [
            'about.txt',
            'projects',
            'contact.md'
          ],
          '/projects': {
            contents: [
              'react-app',
              'node-server'
            ]
          }
        }
      }}
    />
  );
}

export default MyTerminalComponent;