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
   ydoc,
   { connect:false }
  )

  const yText = ydoc.getText('codemirror')
  const connectBtn = document.querySelector('#connect')

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

  const binding = new CodemirrorBinding(yText, editor, provider.awareness)

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


  const nameField = document.querySelector('#name')
  //const connectBtn = [>* @type {HTMLElement} <] (document.getElementById('y-connect-btn'))
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect()
      connectBtn.textContent = 'connect'
    } else {
      provider.connect()
      binding.awareness.setLocalStateField('user', { color: '#008833', name:nameField.value  })
      connectBtn.textContent = 'disconnect'
    }
  })

  // @ts-ignore

  const socket = new WebSocket('ws://localhost:8081');

  // Listen for messages
  socket.addEventListener('message', function (event) {
    const msg = JSON.parse( event.data )

    switch( msg.cmd ) {
      case 'msg':
        console.log( msg.body )
        break
      case 'eval':
        eval( msg.body )
        break
      default:
        console.log( 'error for message:', event.data )
    }
  })

  window.password = null
  window.send = function( msg ) {
    msg.password = password
    socket.send( JSON.stringify( msg ) )
  }
  window.site = function( url ) {
    window.send({ cmd:'eval', body:`window.open( '${url}' )` })
  }
  window.example = { provider, ydoc, yText, Y, socket }
})
