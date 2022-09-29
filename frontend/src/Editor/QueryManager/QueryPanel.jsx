import React, { useState, useRef } from 'react';
import { useEventListener } from '@/_hooks/use-event-listener';

const QueryPanel = ({ children }) => {
  const queryManagerPreferences = JSON.parse(localStorage.getItem('queryManagerPreferences')) ?? {};
  const [isExpanded, setExpanded] = useState(queryManagerPreferences?.isExpanded ?? true);
  const queryPaneRef = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const [height, setHeight] = useState(queryManagerPreferences?.queryPanelHeight ?? 70);
  const [isTopOfQueryPanel, setTopOfQueryPanel] = useState(false);

  const onMouseUp = () => {
    setDragging(false);
  };

  const onMouseDown = () => {
    isTopOfQueryPanel && setDragging(true);
  };

  const onMouseMove = (e) => {
    if (queryPaneRef.current) {
      const componentTop = Math.round(queryPaneRef.current.getBoundingClientRect().top);
      const clientY = e.clientY;

      if ((clientY >= componentTop) & (clientY <= componentTop + 5)) {
        setTopOfQueryPanel(true);
      } else if (isTopOfQueryPanel) {
        setTopOfQueryPanel(false);
      }

      if (isDragging) {
        let height = (clientY / window.innerHeight) * 100;

        if (height > 95) height = 100;
        if (height < 4.5) height = 4.5;
        localStorage.setItem(
          'queryManagerPreferences',
          JSON.stringify({ ...queryManagerPreferences, queryPanelHeight: height, isExpanded: true })
        );
        setExpanded(true);
        setHeight(height);
      }
    }
  };

  useEventListener('mousemove', onMouseMove);
  useEventListener('mouseup', onMouseUp);

  const toggleQueryEditor = () => {
    localStorage.setItem(
      'queryManagerPreferences',
      JSON.stringify({ ...queryManagerPreferences, isExpanded: !isExpanded })
    );
    setExpanded(!isExpanded);
  };

  return (
    <>
      <div
        className="query-pane"
        style={{
          height: 40,
          background: '#fff',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h5 className="mb-0">QUERIES</h5>
        <span onClick={toggleQueryEditor} className="cursor-pointer m-1" data-tip="Show query editor">
          <svg
            style={{ transform: 'rotate(180deg)' }}
            width="18"
            height="10"
            viewBox="0 0 18 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L9 9L17 1" stroke="#61656F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div
        ref={queryPaneRef}
        onMouseDown={onMouseDown}
        className="query-pane"
        style={{
          height: `calc(100% - ${isExpanded ? height : 100}%)`,
          cursor: isDragging || isTopOfQueryPanel ? 'row-resize' : 'default',
        }}
      >
        {children({
          toggleQueryEditor,
          queryPanelHeight: height,
        })}
      </div>
    </>
  );
};

export { QueryPanel };
