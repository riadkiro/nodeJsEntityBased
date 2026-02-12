/**
 * EventModal — Add/Edit event modal
 * Pixel-perfect reproduction from Vristo apps-calendar.html
 */
import React from 'react'

export default function EventModal({
    isOpen,
    onClose,
    params,
    setParams,
    onSave,
    minStartDate,
    minEndDate,
    onStartDateChange,
}) {
    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(params)
    }

    const handleFieldChange = (field, value) => {
        setParams(prev => ({ ...prev, [field]: value }))
        if (field === 'start' && onStartDateChange) {
            onStartDateChange(value)
        }
    }

    return (
        <div className={`fixed inset-0 z-[999] overflow-y-auto bg-[black]/60 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="flex min-h-screen items-center justify-center px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
                <div className="panel my-8 w-[90%] max-w-lg overflow-hidden rounded-lg border-0 p-0 md:w-full animate__animated animate__fadeIn">
                    {/* Close button */}
                    <button
                        type="button"
                        className="absolute top-4 text-white-dark hover:text-dark ltr:right-4 rtl:left-4"
                        onClick={onClose}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    {/* Header */}
                    <h3 className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                        {params.id ? 'Edit Event' : 'Add Event'}
                    </h3>

                    {/* Form */}
                    <div className="p-5">
                        <form onSubmit={handleSubmit}>
                            {/* Title */}
                            <div className="mb-5">
                                <label htmlFor="cal-title">Event Title :</label>
                                <input
                                    id="cal-title"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter Event Title"
                                    value={params.title}
                                    onChange={(e) => handleFieldChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Start Date */}
                            <div className="mb-5">
                                <label htmlFor="cal-start">From :</label>
                                <input
                                    id="cal-start"
                                    type="datetime-local"
                                    className="form-input"
                                    placeholder="Event Start Date"
                                    value={params.start}
                                    onChange={(e) => handleFieldChange('start', e.target.value)}
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div className="mb-5">
                                <label htmlFor="cal-end">To :</label>
                                <input
                                    id="cal-end"
                                    type="datetime-local"
                                    className="form-input"
                                    placeholder="Event End Date"
                                    value={params.end}
                                    onChange={(e) => handleFieldChange('end', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-5">
                                <label htmlFor="cal-description">Event Description :</label>
                                <textarea
                                    id="cal-description"
                                    className="form-textarea min-h-[130px]"
                                    placeholder="Enter Event Description"
                                    value={params.description}
                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                ></textarea>
                            </div>

                            {/* Badge Color */}
                            <div className="mb-5">
                                <label>Badge:</label>
                                <div className="mt-3">
                                    <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="badge"
                                            value="primary"
                                            checked={params.type === 'primary'}
                                            onChange={(e) => handleFieldChange('type', e.target.value)}
                                        />
                                        <span className="ltr:pl-2 rtl:pr-2">Work</span>
                                    </label>
                                    <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                        <input
                                            type="radio"
                                            className="form-radio text-info"
                                            name="badge"
                                            value="info"
                                            checked={params.type === 'info'}
                                            onChange={(e) => handleFieldChange('type', e.target.value)}
                                        />
                                        <span className="ltr:pl-2 rtl:pr-2">Travel</span>
                                    </label>
                                    <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                        <input
                                            type="radio"
                                            className="form-radio text-success"
                                            name="badge"
                                            value="success"
                                            checked={params.type === 'success'}
                                            onChange={(e) => handleFieldChange('type', e.target.value)}
                                        />
                                        <span className="ltr:pl-2 rtl:pr-2">Personal</span>
                                    </label>
                                    <label className="inline-flex cursor-pointer">
                                        <input
                                            type="radio"
                                            className="form-radio text-danger"
                                            name="badge"
                                            value="danger"
                                            checked={params.type === 'danger'}
                                            onChange={(e) => handleFieldChange('type', e.target.value)}
                                        />
                                        <span className="ltr:pl-2 rtl:pr-2">Important</span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex items-center justify-end">
                                <button type="button" className="btn btn-outline-danger" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {params.id ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
