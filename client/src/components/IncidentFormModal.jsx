// src/components/IncidentFormModal.js
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import backendApi from '../config/apiService';
import CHOICES from '../config/choicesFallback';

export default function IncidentFormModal({ show, onClose, onCreated }) {
    const [form, setForm] = useState({
        incident_title: '',
        date_of_incident: '',
        time_of_incident: '',
        facility: '',
        department: '',
        site: '',
        category: '',
        sub_category: '',
        description: '',
        persons_involved_type: '',
        persons_involved_details: '',
        injury_damage_type: '',
        injury_damage_details: '',
        waste_type: 'NOT_APPLICABLE',
        waste_category_code: '',
        reported_by_type: '',
        reported_by_name: '',
        reported_by_contact: ''
    });
    const [files, setFiles] = useState([]);
    const qc = useQueryClient();

    // try to load dynamic choices; on error we fall back to CHOICES
    const { data: dynamicChoices, isLoading: choicesLoading } = useQuery({
        queryKey: ['choices'],
        queryFn: async () => {
            const resp = await backendApi.get('/incidents/choices/');
            return resp.data; // should contain keys: categories, sub_categories, person_types, ...
        },
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            console.warn('Failed to load dynamic choices, using fallback', err);
        },
    });

    // pick either backend choices or fallback
    const choices = dynamicChoices ?? CHOICES;

    useEffect(() => {
        if (!show) {
            // reset form on close
            setForm({
                incident_title: '',
                date_of_incident: '',
                time_of_incident: '',
                facility: '',
                department: '',
                site: '',
                category: '',
                sub_category: '',
                description: '',
                persons_involved_type: '',
                persons_involved_details: '',
                injury_damage_type: '',
                injury_damage_details: '',
                waste_type: 'NOT_APPLICABLE',
                waste_category_code: '',
                reported_by_type: '',
                reported_by_name: '',
                reported_by_contact: ''
            });
            setFiles([]);
        }
    }, [show]);

    const createIncident = useMutation({
        mutationFn: async (payload) => {
            const resp = await backendApi.post('/incidents/', payload);
            return resp.data.incident || resp.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['incidents'] });
        },
    });

    const uploadFile = async (incidentId, file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('attachment_type', 'DOCUMENT'); // default; allow user to choose later if needed
        return backendApi.post(`/incidents/${incidentId}/upload_attachment/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // // Check title before submitting
        // const exists = await checkTitle(form.incident_title);
        // if (exists) {
        //     alert("Please change title, title must be unique!");
        //     return; // stop here if duplicate
        // }

        try {
            // create (JSON)
            const created = await createIncident.mutateAsync(form);

            // then upload files (if any)
            if (files && files.length > 0) {
                for (let f of files) {
                    if (f.size > 10 * 1024 * 1024) {
                        // optional: warn and skip
                        console.warn(`Skipping ${f.name}: too large`);
                        continue;
                    }
                    await uploadFile(created.id, f);
                }
            }

            alert('Incident created successfully!');
            if (onCreated) onCreated(created);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Create failed: ' + (err?.response?.data?.detail || err.message));
        }
    };

    if (!show) return null;

    // helper to safely map backend choices shape (backend returns arrays of {value,label})
    const mapOptions = (list) => (Array.isArray(list) ? list : []);

    // Check if title already exists before submitting
    const checkTitle = async (title) => {
        try {
            const resp = await backendApi.get(`/incidents/?incident_title=${title}`);
            // If results exist, title already taken
            console.log(resp.data)
            return resp.data?.results?.length > 0 || resp.data?.length > 0;
        } catch (err) {
            console.error("Title check failed:", err);
            return false; // assume no duplicate if check fails
        }
    };

    return (
        <>
            <div className="modal-backdrop-custom" />
            <div className="modal modal-show" style={{ display: 'block' }}>
                <div className="modal-dialog modal-lg">
                    <form className="modal-content" onSubmit={onSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">Add Incident</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Title</label>
                                    <input required className="form-control" value={form.incident_title}
                                        onChange={e => setForm({ ...form, incident_title: e.target.value })} />

                                    {/* real-time validation */}
                                    {/* <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter incident title"
                                        value={form.incident_title || ""}
                                        onChange={e => setForm({ ...form, incident_title: e.target.value })}
                                        onBlur={async () => {
                                            if (form.incident_title) {
                                                const exists = await checkTitle(form.incident_title);
                                                if (exists) alert("Title already exists, please change it!");
                                            }
                                        }}
                                    /> */}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Date</label>
                                    <input required type="date" className="form-control" value={form.date_of_incident}
                                        onChange={e => setForm({ ...form, date_of_incident: e.target.value })} />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Time</label>
                                    <input required type="time" className="form-control" value={form.time_of_incident}
                                        onChange={e => setForm({ ...form, time_of_incident: e.target.value })} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">-- select --</option>
                                        {mapOptions(choices.categories).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Sub-category</label>
                                    <select className="form-select" value={form.sub_category}
                                        onChange={e => setForm({ ...form, sub_category: e.target.value })}>
                                        <option value="">-- select --</option>
                                        {mapOptions(choices.sub_categories).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="3" value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Reported by (type)</label>
                                    <select className="form-select" value={form.reported_by_type}
                                        onChange={e => setForm({ ...form, reported_by_type: e.target.value })}>
                                        <option value="">-- select --</option>
                                        {mapOptions(choices.reported_by_types).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Reported by (name)</label>
                                    <input className="form-control" value={form.reported_by_name}
                                        onChange={e => setForm({ ...form, reported_by_name: e.target.value })} />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Facility</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Location / Facility name where incident occurre"
                                        value={form.facility || ""}
                                        onChange={e => setForm({ ...form, facility: e.target.value })}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Department</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Department where incident occurred"
                                        value={form.department || ""}
                                        onChange={e => setForm({ ...form, department: e.target.value })}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">Site</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Specific site location"
                                        value={form.site || ""}
                                        onChange={e => setForm({ ...form, site: e.target.value })}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Waste type</label>
                                    <select className="form-select" value={form.waste_type}
                                        onChange={e => setForm({ ...form, waste_type: e.target.value })}>
                                        <option value="">-- select --</option>
                                        {mapOptions(choices.waste_types).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Waste category / code</label>
                                    <input className="form-control" value={form.waste_category_code}
                                        onChange={e => setForm({ ...form, waste_category_code: e.target.value })} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Persons Involved Type</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={form.persons_involved_type || ""}
                                        onChange={e => setForm({ ...form, persons_involved_type: e.target.value })}
                                    >
                                        <option value="">-- Select --</option>
                                        {mapOptions(choices.person_types).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Injury/Damage Type</label>
                                    <select
                                        className="form-select"
                                        required
                                        value={form.injury_damage_type || ""}
                                        onChange={e => setForm({ ...form, injury_damage_type: e.target.value })}
                                    >
                                        <option value="">-- Select --</option>
                                        {mapOptions(choices.injury_damage_types).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Injury/Damage Details</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Detailed description of injury or damage"
                                        value={form.injury_damage_details || ""}
                                        onChange={e => setForm({ ...form, injury_damage_details: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Attachments</label>
                                    <input type="file" multiple className="form-control" onChange={e => setFiles(e.target.files)} />
                                    <div className="form-text">Max per file: 10MB</div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
