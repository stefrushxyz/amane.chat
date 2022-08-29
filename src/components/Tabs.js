import React, { useState } from 'react'

export default function Tabs({ classList, tabs }) {
  const [activeTabIdx, setActiveTabIdx] = useState(0)

  return (
    <div className={`${classList} tabs`}>
      <ul className='tab-titles'>
        {tabs.map((tab, idx) => {
          return <li
            className={idx === activeTabIdx ? 'active' : ''}
            onClick={(e) => setActiveTabIdx(idx)}
            style={{ width: `${100 / tabs.length}%` }}
            key={idx}
          >{tab.title}</li>
        })}
      </ul>
      <ul className='tab-contents'>
        {tabs.map((tab, idx) => {
          return <li
            className={idx === activeTabIdx ? 'active' : ''}
            key={idx}
          >{tab.contents}</li>
        })}
      </ul>
    </div>
  )
}
