import React from 'react'

export default function ModalCard({ children, close }) {
    return (
        <div className=" fixed top-0 left-0 sm:-left-5 z-[100] flex h-screen w-full items-center justify-center select-none">
            <div
                className=" absolute h-screen w-full cursor-pointer bg-[#d8d8d8] bg-opacity-80"
                onClick={() => close(false)}
            ></div>
            <div className="z-50">{children}</div>
        </div>
    )
}
