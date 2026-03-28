import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

function Timer({ timeLeft, totalTime }) {
    const percentage = (timeLeft / totalTime) * 100
    return (
        <div className='w-20 h-20'>
            <CircularProgressbar
                value={percentage}
                text={`${timeLeft}s`}
                styles={buildStyles({
                    textSize: "28px",
                    pathColor: "#10b981",
                    textColor: "#e4e4e7",
                    trailColor: "#27272a"
                })}
            />
        </div>
    )
}

export default Timer