// src/components/IncidentDetailModal.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import backendApi from "../config/apiService";
import AttachmentList from "./AttachmentList";

export default function IncidentDetailModal({ incidentId, show, onClose }) {
    const { data: incident, isLoading, error } = useQuery({
        queryKey: ["incident-detail", incidentId],
        queryFn: async () => {
            const resp = await backendApi.get(`/incidents/${incidentId}/`);
            return resp.data;
        },
        enabled: !!incidentId && show,
    });

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop-custom" />
            <div className="modal modal-show" style={{ display: "block" }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                Incident Details {incident ? `#${incident.id}` : ""}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>

                        <div className="modal-body">
                            {isLoading && <div>Loading incident details...</div>}
                            {error && <div className="text-danger">Failed to load</div>}
                            {incident && (
                                <div className="container-fluid">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Title:</strong> {incident.incident_title}
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Date/Time:</strong>{" "}
                                            {incident.date_of_incident} {incident.time_of_incident}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-4">
                                            <strong>Facility:</strong> {incident.facility}
                                        </div>
                                        <div className="col-md-4">
                                            <strong>Department:</strong> {incident.department}
                                        </div>
                                        <div className="col-md-4">
                                            <strong>Site:</strong> {incident.site}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Category:</strong> {incident.category}
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Sub-category:</strong> {incident.sub_category}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Description:</strong>
                                        <p>{incident.description || "-"}</p>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Persons Involved Type:</strong>{" "}
                                            {incident.persons_involved_type}
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Persons Involved Details:</strong>{" "}
                                            {incident.persons_involved_details}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Injury/Damage Type:</strong>{" "}
                                            {incident.injury_damage_type}
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Injury/Damage Details:</strong>{" "}
                                            {incident.injury_damage_details}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Waste Type:</strong> {incident.waste_type}
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Waste Category Code:</strong>{" "}
                                            {incident.waste_category_code}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>Reported By:</strong>{" "}
                                            {incident.reported_by_type} - {incident.reported_by_name}
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Contact:</strong> {incident.reported_by_contact}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Attachments:</strong>
                                        <AttachmentList incidentId={incident.id} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
