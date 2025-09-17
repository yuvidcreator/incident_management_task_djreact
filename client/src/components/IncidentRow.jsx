import React, { useState } from 'react';
import AttachmentList from './AttachmentList';

export default function IncidentRow({ incident, index, onView, onEdit, onDelete }) {
    const [showAttachments, setShowAttachments] = useState(false);

    const title = incident.incident_title || incident.title || '-';
    const date = incident.date_of_incident || incident.incident_date || '';
    const time = incident.time_of_incident || incident.incident_time || '';
    const facility = incident.facility || incident.location || '-';
    const category = incident.category || '-';
    const reportedBy = incident.reported_by_name || incident.reported_by || '-';
    const attachmentCount = incident.attachment_count ?? (incident.attachments ? incident.attachments.length : 0);

    return (
        <>
            <tr>
                <td>{index + 1}</td>
                <td style={{ minWidth: 200 }}>{title}</td>
                <td>{date ? `${date} ${time ? time : ''}` : '-'}</td>
                <td>{facility}</td>
                <td>{category}</td>
                <td>{reportedBy}</td>
                <td>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAttachments(s => !s)}>
                        {attachmentCount} file{attachmentCount !== 1 ? 's' : ''}
                    </button>
                </td>
                <td>
                    {/* <button className="btn btn-sm btn-outline-primary me-2" onClick={onEdit}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>Delete</button> */}
                    <button className="btn btn-sm btn-outline-info me-2" onClick={onView}>View</button>
                </td>
            </tr>

            {showAttachments && (
                <tr>
                    <td colSpan="8" className="bg-light">
                        <AttachmentList incidentId={incident.id} />
                    </td>
                </tr>
            )}
        </>
    );
}
