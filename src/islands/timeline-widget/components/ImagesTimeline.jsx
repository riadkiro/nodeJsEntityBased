/**
 * ImagesTimeline — Avatar-based timeline with descriptions
 * 
 * Pixel-perfect replica of the Vristo "With Images" timeline variant.
 * Each item: time | avatar with connector line | relative time | description
 */
import React from 'react'

export default function ImagesTimeline({ items }) {
    return (
        <div className="mb-5">
            <div className="mx-auto max-w-[900px] space-y-3 text-center sm:space-y-0 ltr:sm:text-left rtl:sm:text-right">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1

                    return (
                        <div className="items-center sm:flex" key={item.id || idx}>
                            {/* Time */}
                            <p className="p-2.5 text-base font-semibold text-[#3b3f5c] dark:text-white-light">
                                {item.time}
                            </p>

                            {/* Avatar with connector */}
                            <div className={`relative p-2.5 ${!isLast
                                    ? 'after:absolute after:left-1/2 after:top-[25px] after:-bottom-[15px] after:h-auto after:w-0 after:-translate-x-1/2 after:rounded-full after:border-l-2 after:border-white-dark/20'
                                    : ''
                                }`}>
                                {item.avatar ? (
                                    <img
                                        src={item.avatar}
                                        alt={item.name || 'user'}
                                        className="relative z-[1] mx-auto h-11 w-11 rounded-full"
                                    />
                                ) : (
                                    <div className="relative z-[1] mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                                        {(item.name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Relative time */}
                            <p className="mt-5 self-center p-2.5 text-xs font-bold text-white-dark sm:mt-0 sm:min-w-[100px] sm:max-w-[100px]">
                                {item.relative}
                            </p>

                            {/* Description */}
                            <p className="p-2.5 text-[13px] font-semibold text-[#3b3f5c] dark:text-white-light">
                                {item.title}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
