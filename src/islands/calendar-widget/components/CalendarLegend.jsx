/**
 * CalendarLegend — Color-coded legend for event types
 * Pixel-perfect from Vristo apps-calendar.html
 */
import React from 'react'

export default function CalendarLegend() {
    return (
        <div className="mb-4 sm:mb-0">
            <div className="text-center text-lg font-semibold ltr:sm:text-left rtl:sm:text-right">Calendar</div>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start">
                <div className="flex items-center ltr:mr-4 rtl:ml-4">
                    <div className="h-2.5 w-2.5 rounded-sm bg-primary ltr:mr-2 rtl:ml-2"></div>
                    <div>Work</div>
                </div>
                <div className="flex items-center ltr:mr-4 rtl:ml-4">
                    <div className="h-2.5 w-2.5 rounded-sm bg-info ltr:mr-2 rtl:ml-2"></div>
                    <div>Travel</div>
                </div>
                <div className="flex items-center ltr:mr-4 rtl:ml-4">
                    <div className="h-2.5 w-2.5 rounded-sm bg-success ltr:mr-2 rtl:ml-2"></div>
                    <div>Personal</div>
                </div>
                <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-sm bg-danger ltr:mr-2 rtl:ml-2"></div>
                    <div>Important</div>
                </div>
            </div>
        </div>
    )
}
