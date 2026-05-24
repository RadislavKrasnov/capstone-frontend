import { Route, Routes } from 'react-router';
import { TailwindTestPage } from '../features/test/TailwindTestPage';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<TailwindTestPage />} />

            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}
