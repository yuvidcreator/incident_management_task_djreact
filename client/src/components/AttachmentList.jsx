// src/components/AttachmentList.js
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backendApi, { BASE_URL, MEDIA_PATH } from "../config/apiService";

export default function AttachmentList({ incidentId }) {
    const queryClient = useQueryClient();

    // Fetch attachments
    const { data: attachments = [], isLoading } = useQuery({
        queryKey: ["attachments", incidentId],
        queryFn: async () => {
            const resp = await backendApi.get(`/incidents/${incidentId}/attachments/`);
            // Handle paginated or non-paginated responses
            return resp.data?.results || resp.data || [];
        },
        enabled: !!incidentId,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => await backendApi.delete(`/attachments/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attachments", incidentId] });
        },
    });

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm("Delete this attachment?")) {
            try {
                await deleteMutation.mutateAsync(id);
                alert("Attachment deleted!");
            } catch (err) {
                console.error(err);
                alert("Delete failed");
            }
        }
    };

    // Loading state
    if (isLoading) return <div className="p-3">Loading attachments...</div>;

    // Empty state
    if (!attachments.length)
        return <div className="p-3 text-muted">No attachments found</div>;

    // Render attachments
    return (
        <div className="row">
            {attachments.map((att) => (
                <div key={att.id} className="col-md-4 mb-3">
                    <div className="card p-2 shadow-sm">
                        <a
                            href={`${BASE_URL}${MEDIA_PATH}/incidents/${att.id}/attachments/${att.file}`}
                            target="_blank"
                            rel="noreferrer"
                            className="fw-bold text-decoration-none"
                        >
                            {att.file.split("/").pop()}
                        </a>
                        <div className="small text-muted">{att.file_type}</div>
                        <button
                            className="btn btn-sm btn-danger mt-2"
                            onClick={() => handleDelete(att.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
