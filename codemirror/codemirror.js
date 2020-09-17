/* eslint-env browser */

// @ts-ignore
import CodeMirror from 'codemirror'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CodemirrorBinding } from 'y-codemirror'
import 'codemirror/mode/javascript/javascript.js'

window.addEventListener('load', () => {
  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider(
   'ws://127.0.0.1:8080',
   'codemirror-large',
    ydoc
  )

  const sharedhdr = document.createElement('h3')
  sharedhdr.innerText = 'shared editor'
  document.body.insertBefore(sharedhdr, null )
  
  const connectBtn = document.createElement('button')
  connectBtn.innerText = 'Disconnect'
  document.body.insertBefore( connectBtn, null )

  const yText = ydoc.getText('codemirror')
  const editorContainer = document.createElement('div')
  editorContainer.setAttribute('id', 'editor')
  document.body.insertBefore(editorContainer, null)

  CodeMirror.keyMap.playground = {
    fallthrough:'default',
    'Ctrl-Enter'( cm ) {
      eval( cm.getValue() )
    }
  }

  const editor = CodeMirror(editorContainer, {
    keyMap:'playground',
    mode: 'javascript',
    lineNumbers: true
  })

  const sharedhdr2 = document.createElement('h3')
  sharedhdr2.innerText = 'your editor'
  document.body.insertBefore(sharedhdr2, null )

  const editorContainer2 = document.createElement('div')
  editorContainer2.setAttribute('id', 'editor2')
  document.body.insertBefore(editorContainer2, null)
 
  const editor2 = CodeMirror(editorContainer2, {
    mode: 'javascript',
    keyMap:'playground',
    lineNumbers: true,
    value:`// press Ctrl+Return to execute code
// make sure your developer console is open to see results

console.log( 'test 1 2 3' )`
  })

  const binding = new CodemirrorBinding(yText, editor, provider.awareness)

  //const connectBtn = [>* @type {HTMLElement} <] (document.getElementById('y-connect-btn'))
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect()
      connectBtn.textContent = 'connect'
    } else {
      provider.connect()
      connectBtn.textContent = 'disconnect'
    }
  })

  // @ts-ignore
  window.example = { provider, ydoc, yText, binding, Y }
})
