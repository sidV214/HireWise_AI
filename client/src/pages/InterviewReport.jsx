import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ServerURL } from '../App'
import Step3Report from '../components/Step3Report'

function InterviewReport() {

    const { id } = useParams()
    const [report, setReport] = useState(null)
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const result = await axios.get(ServerURL + "/api/interview/report/" + id, { withCredentials: true })
                setReport(result.data)
            } catch (error) {
                console.error(error);
            }
        }
        fetchReport()
    },[] )

    if(!report){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                    Loading Report...
                </p>
            </div>
        )
    }

    return <Step3Report report={report}/> 
}

export default InterviewReport

/*
 * ===========================================================================================
 *                              NOTES — InterviewReport.jsx
 * ===========================================================================================
 *
 * PURPOSE: Page-level wrapper that fetches a historical interview report by ID and
 *          renders the Step3Report component with the fetched data.
 *
 * DATA FETCHING: Extracts `:id` from URL params via useParams(). Calls
 * GET /api/interview/report/:id on mount. Sets the report state on success.
 *
 * LOADING: Shows "Loading Report..." while the API call is pending.
 * REUSE: Delegates all rendering to Step3Report — the same component used for live
 * interview reports. This ensures visual consistency between live and historical views.
 *
 * CONNECTIONS: Mounted at /report/:id route. Calls interview controller's
 * getInterviewReport. Renders Step3Report component.
 * ===========================================================================================
 */