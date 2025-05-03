import React, { useEffect, useState } from 'react';

function ApiTest() {
    const [genres, setGenres] = useState(null);
    const [categories, setCategories] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/genres/')
            .then(res => res.ok ? res.json() : Promise.reject('Genres fetch error'))
            .then(data => setGenres(data))
            .catch(err => setError(err));
        fetch('/api/categories/top')
            .then(res => res.ok ? res.json() : Promise.reject('Categories fetch error'))
            .then(data => setCategories(data))
            .catch(err => setError(err));
    }, []);

    if (error) return <pre className="text-red-600">Error: {String(error)}</pre>;
    if (!genres || !categories) return <p>Loading…</p>;

    return (
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-xl font-bold">Genres (all)</h2>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(genres, null, 2)}</pre>
            </div>
            <div>
                <h2 className="text-xl font-bold">Categories (top10)</h2>
                <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(categories, null, 2)}</pre>
            </div>
        </div>
    );
}

export default ApiTest;
