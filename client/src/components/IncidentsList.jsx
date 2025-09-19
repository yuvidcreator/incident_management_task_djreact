import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import backendApi from "../config/apiService";
import IncidentFormModal from './IncidentFormModal';
import IncidentEditModal from './IncidentEditModal';
import IncidentRow from './IncidentRow';
import IncidentDetailModal from "./IncidentDetailModal";


const fetchIncidents = async ({ queryKey }) => {
    const [_key, params] = queryKey;
    const resp = await backendApi.get('/incidents/', { params });
    if (resp.data && resp.data.results) return resp.data;
    return { results: resp.data, count: resp.data?.length || 0 };
};

export default function IncidentsList() {
    const [showAdd, setShowAdd] = useState(false);
    const [editIncident, setEditIncident] = useState(null);
    const [detailIncident, setDetailIncident] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['incidents', { page, search }],
        queryFn: fetchIncidents,
        keepPreviousData: true,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await backendApi.delete(`/incidents/${id}/`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
        },
    });

    const incidents = data?.results || [];

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this incident? This is a soft delete.')) return;
        try {
            await deleteMutation.mutateAsync(id);
            alert('Deleted.');
        } catch (err) {
            console.error(err);
            alert('Delete failed.');
        }
    };

    return (
        <div>
            <div className="mb-3 d-flex justify-content-between">
                <div className="input-group w-50">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search title, description, facility..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') queryClient.invalidateQueries({ queryKey: ['incidents'] }); }}
                    />
                    <button className="btn btn-outline-secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ['incidents'] })}>
                        Search
                    </button>
                </div>

                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Incident</button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Date / Time</th>
                            <th>Facility</th>
                            <th>Category</th>
                            <th>Reported By</th>
                            <th>Attachments</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan="8" className="text-center p-4">Loading...</td></tr>}
                        {!isLoading && incidents.length === 0 && <tr><td colSpan="8" className="text-center p-4">No incidents found</td></tr>}
                        {incidents.map((it, idx) => (
                            <IncidentRow
                                key={it.id}
                                incident={it}
                                index={idx}
                                // onEdit={() => setEditIncident(it)}
                                // onDelete={() => handleDelete(it.id)}
                                onView={() => setDetailIncident(it.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div><small className="text-muted">Showing {incidents.length} of {data?.count ?? incidents.length}</small></div>
                <div>
                    <button className="btn btn-outline-secondary btn-sm me-2" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>

            {/* Add Modal */}
            <IncidentFormModal
                show={showAdd}
                onClose={() => setShowAdd(false)}
                onCreated={() => {
                    setShowAdd(false);
                    queryClient.invalidateQueries({ queryKey: ['incidents'] });
                }}
            />

            {/* Edit Modal */}
            {/* {editIncident && (
                <IncidentEditModal
                    incident={editIncident}
                    onClose={() => setEditIncident(null)}
                    onSaved={() => {
                        setEditIncident(null);
                        queryClient.invalidateQueries({ queryKey: ['incidents'] });
                    }}
                />
            )} */}

            {/* Show detailed View */}
            {detailIncident && (
                <IncidentDetailModal
                    incidentId={detailIncident}
                    show={!!detailIncident}
                    onClose={() => setDetailIncident(null)}
                />
            )}
        </div>
    );
}
