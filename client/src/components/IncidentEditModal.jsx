// src/components/IncidentEditModal.js
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import backendApi from '../config/apiService';
import CHOICES from '../config/choicesFallback';

export default function IncidentEditModal({ incident, onClose, onSaved }) {
    const [form, setForm] = useState({ ...incident });
    const [files, setFiles] = useState([]);
    const qc = useQueryClient();

    const { data: dynamicChoices } = useQuery({
        queryKey: ['choices'],
        queryFn: async () => {
            const r = await backendApi.get('/incidents/choices/');
            return r.data;
        },
        staleTime: 1000 * 60 * 5,
        onError: () => { /* silent fallback */ }
    });

    const choices = dynamicChoices ?? CHOICES;

    useEffect(() => {
        setForm({
            incident_title: incident.incident_title || '',
            date_of_incident: incident.date_of_incident || '',
            time_of_incident: incident.time_of_incident || '',
            facility: incident.facility || '',
            department: incident.department || '',
            site: incident.site || '',
            category: incident.category || '',
            sub_category: incident.sub_category || '',
            description: incident.description || '',
            persons_involved_type: incident.persons_involved_type || '',
            persons_involved_details: incident.persons_involved_details || '',
            injury_damage_type: incident.injury_damage_type || '',
            injury_damage_details: incident.injury_damage_details || '',
            waste_type: incident.waste_type || 'NOT_APPLICABLE',
            waste_category_code: incident.waste_category_code || '',
            reported_by_type: incident.reported_by_type || '',
            reported_by_name: incident.reported_by_name || '',
            reported_by_contact: incident.reported_by_contact || '',
        });
        setFiles([]);
    }, [incident]);

    const updateMutation = useMutation({
        mutationFn: async (payload) => {
            const resp = await backendApi.patch(`/incidents/${incident.id}/`, payload);
            return resp.data.incident || resp.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['incidents'] });
            qc.invalidateQueries({ queryKey: ['attachments', incident.id] });
        }
    });

    const uploadFile = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('attachment_type', 'DOCUMENT');
        return backendApi.post(`/incidents/${incident.id}/upload_attachment/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    const onSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                incident_title: form.incident_title,
                date_of_incident: form.date_of_incident,
                time_of_incident: form.time_of_incident,
                facility: form.facility,
                department: form.department,
                site: form.site,
                category: form.category,
                sub_category: form.sub_category,
                description: form.description,
                persons_involved_type: form.persons_involved_type,
                persons_involved_details: form.persons_involved_details,
                injury_damage_type: form.injury_damage_type,
                injury_damage_details: form.injury_damage_details,
                waste_type: form.waste_type,
                waste_category_code: form.waste_category_code,
                reported_by_type: form.reported_by_type,
                reported_by_name: form.reported_by_name,
                reported_by_contact: form.reported_by_contact,
            };

            await updateMutation.mutateAsync(payload);

            if (files && files.length > 0) {
                for (let f of files) {
                    if (f.size > 10 * 1024 * 1024) continue;
                    await uploadFile(f);
                }
            }

            alert('Saved');
            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Save failed: ' + (err?.response?.data || err.message));
        }
    };

    if (!incident) return null;

    const mapOptions = (list) => (Array.isArray(list) ? list : []);

    return (
        <>
            <div className="modal-backdrop-custom" />
            <div className="modal modal-show" style={{ display: 'block' }}>
                <div className="modal-dialog modal-lg">
                    <form className="modal-content" onSubmit={onSave}>
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Incident</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label">Title</label>
                                    <input className="form-control" value={form.incident_title} onChange={e => setForm({ ...form, incident_title: e.target.value })} />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" value={form.date_of_incident} onChange={e => setForm({ ...form, date_of_incident: e.target.value })} />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Time</label>
                                    <input type="time" className="form-control" value={form.time_of_incident} onChange={e => setForm({ ...form, time_of_incident: e.target.value })} />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Add attachments (optional)</label>
                                    <input type="file" multiple className="form-control" onChange={e => setFiles(e.target.files)} />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button type="submit" className="btn btn-primary">Save changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
