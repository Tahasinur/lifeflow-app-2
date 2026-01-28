import { createReactBlockSpec } from "@blocknote/react";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import './calendar-block.css';

/**
 * Custom Calendar/Date Picker Block for BlockNote
 * Mimics Notion's date picker functionality with popover
 */
export const CalendarBlock = createReactBlockSpec(
  {
    type: "calendar",
    propSchema: {
      date: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const [isOpen, setIsOpen] = useState(false);
      const [isHovered, setIsHovered] = useState(false);
      const wrapperRef = useRef<HTMLDivElement>(null);
      
      const dateValue = block.props.date ? new Date(block.props.date) : undefined;

      const handleDateChange = (date: Date | undefined) => {
        editor.updateBlock(block, {
          props: { date: date ? date.toISOString() : "" },
        });
        setIsOpen(false);
      };

      const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        editor.updateBlock(block, {
          props: { date: "" },
        });
      };

      // Close popover when clicking outside
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };

        if (isOpen) {
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }
      }, [isOpen]);

      return (
        <div 
          className="calendar-block-wrapper" 
          contentEditable={false}
          ref={wrapperRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="calendar-block-inner">
            <div 
              className={`calendar-trigger ${dateValue ? 'has-date' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {dateValue ? (
                <>
                  <span className="calendar-icon">📅</span>
                  <span className="calendar-date-text">
                    {format(dateValue, 'EEEE, MMMM d, yyyy')}
                  </span>
                  {isHovered && (
                    <button
                      className="calendar-clear-btn"
                      onClick={handleClear}
                    >
                      ×
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="calendar-icon">📅</span>
                  <span className="calendar-placeholder-text">Select a date...</span>
                </>
              )}
            </div>
            
            {isOpen && (
              <div className="calendar-popover">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={handleDateChange}
                  className="calendar-picker"
                />
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);
