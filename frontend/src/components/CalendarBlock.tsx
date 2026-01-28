import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import { useState } from "react";
import './calendar-block.css';

/**
 * Custom Calendar/Date Picker Block for BlockNote
 * Shows a hardcoded placeholder calendar (non-functional)
 */
export const CalendarBlock = createReactBlockSpec(
  {
    type: "calendar" as const,
    propSchema: {
      ...defaultProps,
      date: {
        default: "" as const,
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const [isOpen, setIsOpen] = useState(false);
      
      // Generate a simple placeholder calendar for current month
      const generatePlaceholderCalendar = () => {
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        
        const weeks = [];
        let days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
          days.push(<td key={`empty-${i}`} className="calendar-day empty"></td>);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
          const isToday = day === now.getDate();
          days.push(
            <td key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
              {day}
            </td>
          );
          
          // Start a new week
          if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
            weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
            days = [];
          }
        }
        
        return { monthName, weeks };
      };

      const { monthName, weeks } = generatePlaceholderCalendar();

      return (
        <div 
          className="calendar-block-wrapper" 
          contentEditable={false}
        >
          <div className="calendar-block-inner">
            <div 
              className="calendar-trigger"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="calendar-icon">📅</span>
              <span className="calendar-placeholder-text">
                {isOpen ? 'Calendar (Placeholder)' : 'Click to view calendar placeholder'}
              </span>
            </div>
            
            {isOpen && (
              <div className="calendar-popover">
                <div className="calendar-picker">
                  <div className="calendar-header">
                    <h3>{monthName}</h3>
                  </div>
                  <table className="calendar-table">
                    <thead>
                      <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeks}
                    </tbody>
                  </table>
                  <div className="calendar-footer">
                    <small>This is a placeholder calendar (non-functional)</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    },
  }
);

