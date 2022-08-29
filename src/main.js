import React from 'react'
import ReactDom from 'react-dom'
import AmaneChat from './components/AmaneChat'

function main() {
  ReactDom.render(<AmaneChat />, document.getElementById('root'))
}

main()
