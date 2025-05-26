"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../page.css";

export interface IScore {
    username: string;
    instructionCount: number;
    seed: string;
    time: string;
}

type SortField = 'username' | 'instructionCount' | 'time';
type SortDirection = 'asc' | 'desc';

export default function Leaderboard() {
    const [scores, setScores] = useState<IScore[]>([]);
    const [filteredScores, setFilteredScores] = useState<IScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [sortField, setSortField] = useState<SortField>('instructionCount');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [usernameFilter, setUsernameFilter] = useState<string>("");
    const [seedFilter, setSeedFilter] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/");
                    return;
                }

                const response = await fetch("http://localhost:3001/api/leaderboard/scores", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch scores");
                }

                const data: IScore[] = await response.json();
                setScores(data);
                setFilteredScores(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchScores();
        document.title = "Micromouse - Leaderboard";
    }, [router]);

    useEffect(() => {
        const filtered = scores.filter(score => {
            const matchesUsername = usernameFilter === "" ||
                score.username.toLowerCase().includes(usernameFilter.toLowerCase());
            const matchesSeed = seedFilter === "" ||
                score.seed.toLowerCase().includes(seedFilter.toLowerCase());
            return matchesUsername && matchesSeed;
        });

        filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortField) {
                case 'username':
                    aValue = a.username.toLowerCase();
                    bValue = b.username.toLowerCase();
                    break;
                case 'instructionCount':
                    aValue = a.instructionCount;
                    bValue = b.instructionCount;
                    break;
                case 'time':
                    aValue = new Date(a.time).getTime();
                    bValue = new Date(b.time).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredScores(filtered);
    }, [scores, usernameFilter, seedFilter, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return "";
        return sortDirection === 'asc' ? "↑" : "↓";
    };

    if (isLoading) {
        return (
            <div id="main-layout">
                <div id="header">
                    <span>Micromouse - Leaderboard</span>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 80px)',
                    color: '#43e97b',
                    fontSize: '1.2rem'
                }}>
                    Loading scores...
                </div>
            </div>
        );
    }

    return (
        <div id="main-layout">
            <div id="header" style={{ position: 'relative' }}>
                <span>Micromouse - Leaderboard</span>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        position: 'absolute',
                        right: '32px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#4CAF50',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                    }}
                    title="Back to Game"
                >
                    ←
                </button>
            </div>
            <div id="content">
                <div id="main" style={{ flexDirection: 'column', gap: '24px', padding: '32px' }}>
                    {error && (
                        <div className="card" style={{ padding: '24px', background: '#ff5858', color: 'white' }}>
                            <h3 style={{ margin: '0 0 8px 0' }}>Error</h3>
                            <p style={{ margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <div className="card" style={{ padding: '24px' }}>
                        <h2 style={{ color: "#43e97b", fontWeight: 600, margin: '0 0 24px 0' }}>
                            Leaderboard ({filteredScores.length} results)
                        </h2>

                        {/* Filters */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '24px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ color: '#2196f3', fontWeight: 600 }}>
                                    Filter by Username:
                                </label>
                                <input
                                    type="text"
                                    value={usernameFilter}
                                    onChange={(e) => setUsernameFilter(e.target.value)}
                                    placeholder="Enter username..."
                                    style={{
                                        background: '#1a1d22',
                                        border: '1px solid #2f353e',
                                        borderRadius: '6px',
                                        color: '#2196f3',
                                        padding: '8px 12px',
                                        fontSize: '1rem',
                                        minWidth: '200px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ color: '#f09819', fontWeight: 600 }}>
                                    Filter by Seed:
                                </label>
                                <input
                                    type="text"
                                    value={seedFilter}
                                    onChange={(e) => setSeedFilter(e.target.value)}
                                    placeholder="Enter seed..."
                                    style={{
                                        background: '#1a1d22',
                                        border: '1px solid #2f353e',
                                        borderRadius: '6px',
                                        color: '#f09819',
                                        padding: '8px 12px',
                                        fontSize: '1rem',
                                        minWidth: '200px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{
                            overflowX: 'auto',
                            border: '1px solid #2f353e',
                            borderRadius: '12px',
                            background: '#1a1d22'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '1rem'
                            }}>
                                <thead>
                                <tr style={{ background: '#23272f' }}>
                                    <th
                                        style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            color: '#2196f3',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            borderBottom: '1px solid #2f353e'
                                        }}
                                        onClick={() => handleSort('username')}
                                    >
                                        Username {getSortIcon('username')}
                                    </th>
                                    <th
                                        style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            color: '#ff5858',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            borderBottom: '1px solid #2f353e'
                                        }}
                                        onClick={() => handleSort('instructionCount')}
                                    >
                                        Instructions {getSortIcon('instructionCount')}
                                    </th>
                                    <th
                                        style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            color: '#f09819',
                                            fontWeight: 600,
                                            borderBottom: '1px solid #2f353e'
                                        }}
                                    >
                                        Seed
                                    </th>
                                    <th
                                        style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            color: '#43e97b',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            borderBottom: '1px solid #2f353e'
                                        }}
                                        onClick={() => handleSort('time')}
                                    >
                                        Date & Time {getSortIcon('time')}
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredScores.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            style={{
                                                padding: '32px',
                                                textAlign: 'center',
                                                color: '#a0aec0',
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            No scores found matching the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredScores.map((score, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                borderBottom: index < filteredScores.length - 1 ? '1px solid #2f353e' : 'none'
                                            }}
                                        >
                                            <td style={{
                                                padding: '16px',
                                                color: '#2196f3',
                                                fontWeight: 500
                                            }}>
                                                {score.username}
                                            </td>
                                            <td style={{
                                                padding: '16px',
                                                color: '#ff5858',
                                                fontWeight: 600
                                            }}>
                                                {score.instructionCount}
                                            </td>
                                            <td style={{
                                                padding: '16px',
                                                color: '#f09819',
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem'
                                            }}>
                                                {score.seed}
                                            </td>
                                            <td style={{
                                                padding: '16px',
                                                color: '#43e97b'
                                            }}>
                                                {formatDate(score.time)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}