import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import RateInputPage from './RateInputPage';
import initialRates from "../data/rateDB.json";

// Mock axios
jest.mock('axios');

// Mock child components
jest.mock('../components/RateInputModal', () => ({ show, onClose, onSave, initialData }) => (
    <div data-testid="rate-input-modal">
        RateInputModal Mock
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSave(initialData || { itemNo: '123', description: 'Test Item', rate: 100, per: 'Each', unit: 'Pcs' })}>Save Item</button>
    </div>
));
jest.mock('../components/ItemDetailsModal', () => ({ show, onClose, item }) => (
    <div data-testid="item-details-modal">
        ItemDetailsModal Mock
        <button onClick={onClose}>Close Details Modal</button>
    </div>
));

describe('RateInputPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock a successful fetch by default
        axios.get.mockResolvedValue({ data: initialRates });
        axios.post.mockResolvedValue({});
        axios.put.mockResolvedValue({});
        axios.delete.mockResolvedValue({});
    });

    test('renders Rate Input Page title', async () => {
        render(<RateInputPage />);
        expect(screen.getByText(/Rate Input Page/i)).toBeInTheDocument();
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    });

    test('displays loading message initially', () => {
        axios.get.mockResolvedValue(new Promise(() => { })); // Never resolve to keep loading
        render(<RateInputPage />);
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    test('displays error message if fetching rates fails and local data fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        render(<RateInputPage />);
        await waitFor(() => {
            expect(screen.getByText(/Failed to load rates from local data./i)).toBeInTheDocument();
        });
    });

    test('displays local data if fetching rates fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        render(<RateInputPage />);
        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch rates. Showing local data instead./i)).toBeInTheDocument();
            expect(screen.getByText(/Test Item 1/i)).toBeInTheDocument(); // Assuming initialRates has a Test Item 1
        });
    });

    test('opens RateInputModal when Add Rate button is clicked', async () => {
        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByRole('button', { name: /Add Rate/i }));
        expect(screen.getByTestId('rate-input-modal')).toBeInTheDocument();
    });

    test('closes RateInputModal when onClose is called', async () => {
        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByRole('button', { name: /Add Rate/i }));
        expect(screen.getByTestId('rate-input-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Close Modal/i }));
        expect(screen.queryByTestId('rate-input-modal')).not.toBeInTheDocument();
    });

    test('calls handleSaveItem when RateInputModal onSave is triggered for new item', async () => {
        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByRole('button', { name: /Add Rate/i }));
        fireEvent.click(screen.getByRole('button', { name: /Save Item/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/rate'), expect.any(Object));
        });
    });

    test('calls handleSaveItem when RateInputModal onSave is triggered for existing item', async () => {
        const initialItem = { _id: '123', itemNo: 'EDIT_ITEM', description: 'Initial Desc', rate: 100, per: 'Each', unit: 'Pcs' };
        axios.get.mockResolvedValueOnce({ data: [initialItem] });

        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
        fireEvent.click(screen.getByRole('button', { name: /Save Item/i }));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledTimes(1);
            expect(axios.put).toHaveBeenCalledWith(expect.stringContaining(`/api/rate/${initialItem._id}`), expect.any(Object));
        });
    });

    test('opens ItemDetailsModal when View button is clicked', async () => {
        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        const viewButtons = screen.getAllByRole('button', { name: /View/i });
        fireEvent.click(viewButtons[0]);
        expect(screen.getByTestId('item-details-modal')).toBeInTheDocument();
    });

    test('closes ItemDetailsModal when onClose is called', async () => {
        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        const viewButtons = screen.getAllByRole('button', { name: /View/i });
        fireEvent.click(viewButtons[0]);
        expect(screen.getByTestId('item-details-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Close Details Modal/i }));
        expect(screen.queryByTestId('item-details-modal')).not.toBeInTheDocument();
    });

    test('calls handleDeleteItem when Delete button is clicked and confirmed', async () => {
        window.confirm = jest.fn(() => true);
        const initialItem = { _id: '123', itemNo: 'ITEM_TO_DELETE', description: 'Delete Me', rate: 50, per: 'Each', unit: 'Pcs' };
        axios.get.mockResolvedValueOnce({ data: [initialItem] });

        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this item?');

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledTimes(1);
            expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining(`/api/rate/${initialItem._id}`));
        });
    });

    test('does not call handleDeleteItem when Delete button is clicked and cancelled', async () => {
        window.confirm = jest.fn(() => false);
        const initialItem = { _id: '123', itemNo: 'ITEM_TO_DELETE', description: 'Delete Me', rate: 50, per: 'Each', unit: 'Pcs' };
        axios.get.mockResolvedValueOnce({ data: [initialItem] });

        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this item?');

        await waitFor(() => {
            expect(axios.delete).not.toHaveBeenCalled();
        });
    });

    test('filters data based on search query', async () => {
        const data = [
            { _id: '1', itemNo: '1.0', description: 'Item one', rate: 10, per: 'Each', unit: 'Pcs' },
            { _id: '2', itemNo: '2.0', description: 'Another item', rate: 20, per: 'Each', unit: 'Pcs' },
        ];
        axios.get.mockResolvedValueOnce({ data });

        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        const searchInput = screen.getByPlaceholderText(/Search by Item No or Description.../i);
        fireEvent.change(searchInput, { target: { value: 'one' } });

        expect(screen.getByText(/Item one/i)).toBeInTheDocument();
        expect(screen.queryByText(/Another item/i)).not.toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: 'another' } });
        expect(screen.queryByText(/Item one/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Another item/i)).toBeInTheDocument();
    });

    test('pagination controls work correctly', async () => {
        const longData = Array.from({ length: 25 }, (_, i) => ({
            _id: `${i}`, itemNo: `${i + 1}.0`, description: `Item ${i + 1}`, rate: 10 + i, per: 'Each', unit: 'Pcs'
        }));
        axios.get.mockResolvedValueOnce({ data: longData });

        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        // Initial page (1-10)
        expect(screen.getByText('Item 1', { exact: true })).toBeInTheDocument();
        expect(screen.queryByText('Item 11', { exact: true })).not.toBeInTheDocument();

        // Go to next page
        fireEvent.click(screen.getByRole('button', { name: /Next/i }));
        expect(screen.queryByText(/Item 1/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Item 11/i)).toBeInTheDocument();

        // Go to page 3
        fireEvent.click(screen.getByRole('button', { name: /3/i }));
        expect(screen.queryByText(/Item 11/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Item 21/i)).toBeInTheDocument();

        // Go to previous page
        fireEvent.click(screen.getByRole('button', { name: /Prev/i }));
        expect(screen.getByText(/Item 11/i)).toBeInTheDocument();
        expect(screen.queryByText(/Item 21/i)).not.toBeInTheDocument();
    });

    test('sorting by itemNo works correctly', async () => {
        const unsortedData = [
            { _id: '1', itemNo: '1.2.1', description: 'Item 1.2.1', rate: 10, per: 'Each', unit: 'Pcs' },
            { _id: '2', itemNo: '1.2.10', description: 'Item 1.2.10', rate: 20, per: 'Each', unit: 'Pcs' },
            { _id: '3', itemNo: '1.2.2', description: 'Item 1.2.2', rate: 30, per: 'Each', unit: 'Pcs' },
            { _id: '4', itemNo: '1.1', description: 'Item 1.1', rate: 40, per: 'Each', unit: 'Pcs' },
        ];
        axios.get.mockResolvedValueOnce({ data: unsortedData });

        render(<RateInputPage />);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

        const itemDescriptions = screen.getAllByRole('row')
            .slice(1) // Skip the header row
            .map(row => row.children[1].textContent); // Get the text content of the second column (description)

        expect(itemDescriptions).toEqual([
            'Item 1.1',
            'Item 1.2.1',
            'Item 1.2.2',
            'Item 1.2.10',
        ]);
    });
});
