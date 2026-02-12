/**
 * BasicTimeline — Simple left-aligned dot timeline
 * 
 * Pixel-perfect replica of the Vristo "Basic" timeline variant.
 * Each item: time label | colored dot with connector line | title + relative time
 */
import React from 'react'

const BORDER_COLORS = {
    primary: 'before:border-primary after:border-primary',
    secondary: 'before:border-secondary after:border-secondary',
    success: 'before:border-success after:border-success',
    danger: 'before:border-danger after:border-danger',
    warning: 'before:border-warning after:border-warning',
    info: 'before:border-info after:border-info',
}

export default function BasicTimeline({ items }) {
    return (
        <div className="mb-5">
            <div className="mx-auto max-w-[900px]">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1
                    const borderColor = BORDER_COLORS[item.color] || BORDER_COLORS.primary

                    return (
                        <div className="flex" key={item.id || idx}>
                            <p className="min-w-[58px] max-w-[100px] py-2.5 text-base font-semibold text-[#3b3f5c] dark:text-white-light">
                                {item.time}
                            </p>
                            <div
                                className={`relative before:absolute before:left-1/2 before:top-[15px] before:h-2.5 before:w-2.5 before:-translate-x-1/2 before:rounded-full before:border-2 ${borderColor} ${!isLast
                                        ? 'after:absolute after:left-1/2 after:top-[25px] after:-bottom-[15px] after:h-auto after:w-0 after:-translate-x-1/2 after:rounded-full after:border-l-2'
                                        : ''
                                    }`}
                            ></div>
                            <div className="self-center p-2.5 ltr:ml-2.5 rtl:ml-2.5 rtl:ltr:mr-2.5">
                                <p className="text-[13px] font-semibold text-[#3b3f5c] dark:text-white-light">
                                    {item.title}
                                </p>
                                <p className="min-w-[100px] max-w-[100px] self-center text-xs font-bold text-white-dark">
                                    {item.relative}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
