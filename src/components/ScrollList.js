import React, { useState, useEffect, useRef } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

const TRANSITION_MS = 300

export default function ScrollList({
  items,
  setItems,
  expandedItemId,
  children,
  listTag='ol',
  listClassName='',
}) {
  const [sortingItemId, setSortingItemId] = useState(null)
  const [contentsPosition, setContentsPosition] = useState(0)
  const [barPosition, setBarPosition] = useState(0)
  const [barVisible, setBarVisible] = useState(false)
  const [barActive, setBarActive] = useState(false)
  const [locked, setLocked] = useState(false)
  const containerRef = useRef()
  const contentsRef = useRef()
  const barRef = useRef()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGettter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor),
  )

  useEffect(() => {
    if (locked) {
      containerRef.current.classList.add('locked')
    }
    else {
      containerRef.current.classList.remove('locked')
    }
  }, [locked])

  function lock() {
    setLocked(true)
    setBarVisible(false)
    setBarActive(false)
    scrollToItemIndex(items.findIndex(({ id }) => id === expandedItemId))
  }

  function unlock() {
    setLocked(false)
  }

  function resetScroll() {
    const {
      height: containerHeight
    } = containerRef.current.getBoundingClientRect()
    const {
      height: contentsHeight
    } = contentsRef.current.getBoundingClientRect()

    const contentsFitContainer = contentsHeight > containerHeight
    const contentsOverscrolled =
      contentsPosition >= contentsHeight - containerHeight - 1

    if (!locked) {
      setBarVisible(contentsFitContainer)
    }

    if (!contentsFitContainer) {
      scrollToPosition({ y: 0 })
    }
    else if (contentsOverscrolled) {
      scrollToPosition({ y: Infinity })
    }
  }

  function scrollToItemIndex(idx) {
    if (idx !== -1) {
      const itemHeight = getItemHeight()
      scrollToPosition({ y: idx * itemHeight }, true)
    }
  }

  function scrollToPosition({ x, y }, ignoreMax=false) {
    const {
      top: containerTop,
      left: containerLeft,
      width: containerWidth,
      height: containerHeight,
    } = containerRef.current.getBoundingClientRect()
    const {
      width: contentsWidth,
      height: contentsHeight,
    } = contentsRef.current.getBoundingClientRect()
    const {
      width: barWidth,
      height: barHeight,
    } = barRef.current.getBoundingClientRect()

    const maxContentsPosition = getMaxContentsPosition()
    const nextContentsPosition = Math.max(0,
      Math.min(y, ignoreMax ? Infinity : maxContentsPosition)
    )
    setContentsPosition(nextContentsPosition)

    if (maxContentsPosition > 0 && maxContentsPosition < Infinity) {
      const nextBarPosition =
        (Math.min(1, nextContentsPosition / maxContentsPosition) *
        (containerHeight - barHeight + 2)) - 1
      setBarPosition(nextBarPosition)
    }
  }

  function getMaxContentsPosition() {
    const {
      height: containerHeight,
    } = containerRef.current.getBoundingClientRect()
    const {
      height: contentsHeight,
    } = contentsRef.current.getBoundingClientRect()
    return Math.max(0, contentsHeight - containerHeight - 1)
  }

  function getItemHeight() {
    const firstItem = contentsRef.current.children[0].children[0]
    const secondItem = contentsRef.current.children[0].children[1]

    let itemHeight = Infinity

    if (firstItem !== undefined) {
      const firstItemHeight = firstItem.getBoundingClientRect().height
      itemHeight = Math.min(itemHeight, firstItemHeight)
    }
    if (secondItem !== undefined) {
      const secondItemHeight = secondItem.getBoundingClientRect().height
      itemHeight = Math.min(itemHeight, secondItemHeight)
    }
    if (itemHeight === Infinity) {
      itemHeight = 0
    }

    return itemHeight
  }

  function handleWheel(e){
    if (!locked) {
      scrollToPosition({ y: contentsPosition + e.deltaY })
    }
  }

  function handleBarDrag(e) {
    e.preventDefault()

    if (!locked) {
      setBarActive(true)
      document.activeElement.blur()
      window.addEventListener('mousemove', barMouseMove)
      window.addEventListener('mouseup', barMouseUp)
    }
  }

  const mouseMoveRate = 3
  let mouseMoveCounter = mouseMoveRate

  function barMouseMove(e) {
    e.preventDefault()

    if (mouseMoveCounter < mouseMoveRate) {
      mouseMoveCounter += 1
      return
    }

    mouseMoveCounter = 0

    if (containerRef.current.classList.contains('locked')) {
      barMouseUp(e)
      return
    }

    const {
      height: containerHeight,
      top: containerTop,
    } = containerRef.current.getBoundingClientRect()
    const {
      height: barHeight,
      top: barTop,
    } = barRef.current.getBoundingClientRect()

    const containerY = e.clientY - containerTop - (barHeight / 2)
    const containerMax = containerHeight - barHeight
    const selectedPosition = Math.min(containerY / containerMax, 1)
    const maxContentsPosition = getMaxContentsPosition()
    scrollToPosition({ y: selectedPosition * maxContentsPosition })
  }

  function barMouseUp(e) {
    setBarActive(false)
    window.removeEventListener('mousemove', barMouseMove)
    window.removeEventListener('mouseup', barMouseUp)
  }

  function handleDragStart(event) {
    const { active } = event

    setSortingItemId(active.id)
  }

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(({ id }) => id === active.id)
        const newIndex = items.findIndex(({ id }) => id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }

    setSortingItemId(null)
  }

  const containerClassList = [
    listClassName,
    'scroll-list-container',
  ].join(' ').trim()

  const barClassList = [
    'scroll-list-bar',
    barActive ? 'active' : '',
  ].join(' ').trim()

  const ListContents = listTag

  return (
    <div
      className={containerClassList}
      ref={containerRef}
      onWheel={handleWheel}
    >
      <div
        className='scroll-list-contents'
        ref={contentsRef}
        style={{ top: `-${contentsPosition}px` }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <TransitionGroup
              component={listTag}
              className='scroll-list'
            >
              {items.map(({ id }, idx) => (
                <CSSTransition
                  timeout={TRANSITION_MS}
                  classNames='item'
                  key={id}
                >
                  <CSSTransition
                    in={id === expandedItemId}
                    timeout={TRANSITION_MS}
                    classNames='expanded'
                    appear
                  >
                    <ScrollListItem
                      id={id}
                      item={children[idx]}
                    />
                  </CSSTransition>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </SortableContext>
        </DndContext>
      </div>
      <CSSTransition
        in={barVisible}
        timeout={TRANSITION_MS}
        classNames='bar'
      >
        <CSSTransition
          in={barActive}
          timeout={TRANSITION_MS}
          classNames='bar-active'
        >
          <div
            className='scroll-list-bar'
            ref={barRef}
            onMouseDown={handleBarDrag}
            style={{ top: `${barPosition}px` }}
          ></div>
        </CSSTransition>
      </CSSTransition>
    </div>
  )
}

function ScrollListItem({ id, item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li ref={setNodeRef} style={style}>
      {{
        ...item,
        props: {
          ...item.props,
          sortHandleData: { attributes, listeners },
        },
      }}
    </li>
  )
}
