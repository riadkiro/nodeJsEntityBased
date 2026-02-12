/**
 * ModernTimeline — Centered vertical line with alternating cards
 * 
 * Pixel-perfect replica of the Vristo "Modern" timeline variant.
 * Cards alternate left/right with dot connectors on a centered vertical line.
 * Each card has: image, colored title, description, and action button.
 */
import React from 'react'

const COLOR_CLASSES = {
    info: { dot: 'bg-info', title: 'text-info', btn: 'btn btn-info' },
    primary: { dot: 'bg-primary', title: 'text-primary', btn: 'btn btn-primary' },
    success: { dot: 'bg-success', title: 'text-success', btn: 'btn btn-success' },
    danger: { dot: 'bg-danger', title: 'text-danger', btn: 'btn btn-danger' },
    warning: { dot: 'bg-warning', title: 'text-warning', btn: 'btn btn-warning' },
    secondary: { dot: 'bg-secondary', title: 'text-secondary', btn: 'btn btn-secondary' },
}

export default function ModernTimeline({ items }) {
    return (
        <div className="mb-5 inline-block w-full">
            <ul className="relative mx-auto table max-w-[900px] py-12 before:absolute before:bottom-0 before:left-1/2 before:top-0 before:-ml-[1.5px] before:w-[3px] before:bg-[#ebedf2] dark:before:bg-[#191e3a]">
                {items.map((item, idx) => {
                    const isLeft = idx % 2 === 0
                    const color = COLOR_CLASSES[item.color] || COLOR_CLASSES.primary

                    return (
                        <li key={item.id || idx} className="relative mb-12 before:clear-both before:table after:clear-both after:table">
                            {/* Center dot */}
                            <div className={`absolute left-1/2 top-[32px] z-[1] -ml-2.5 hidden h-5 w-5 rounded-full border-[3px] border-[#ebedf2] ${color.dot} dark:border-[#191e3a] sm:block`}></div>

                            {/* Card */}
                            <div className={`relative mx-auto w-full max-w-[320px] rounded-md border border-[#ebedf2] bg-white shadow-[0_20px_20px_rgba(126,142,177,0.12)] before:absolute before:top-10 before:hidden before:h-[3px] before:w-[37px] before:rounded-full before:bg-[#ebedf2] dark:border-[#191e3a] dark:bg-[#191e3a] dark:before:bg-[#191e3a] sm:w-[46%] sm:max-w-full sm:before:block ${isLeft
                                    ? 'ltr:before:-right-[37px] rtl:before:-left-[37px] ltr:sm:float-left rtl:sm:float-right'
                                    : 'ltr:before:-left-[37px] rtl:before:-right-[37px] ltr:sm:float-right rtl:sm:float-left'
                                }`}>
                                {item.image && (
                                    <div>
                                        <img src={item.image} alt={item.title || 'timeline'} className="w-full rounded-t-md" />
                                    </div>
                                )}
                                <div className="p-5">
                                    <h4 className={`mb-3 text-lg font-semibold ${color.title}`}>
                                        {item.title}
                                    </h4>
                                    <p className="mb-3 text-white-dark">
                                        {item.description}
                                    </p>
                                    {item.actionLabel && (
                                        <p>
                                            <button
                                                type="button"
                                                className={color.btn}
                                                onClick={() => item.onAction && item.onAction(item)}
                                            >
                                                {item.actionLabel}
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
