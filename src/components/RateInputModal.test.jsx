import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import RateInputModal from './RateInputModal';

// Mock axios
jest.mock('axios');

describe('RateInputModal - Item No Uniqueness', () => {

    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display an error and disable save button if item number is not unique', async () => {
        axios.get.mockResolvedValueOnce({ data: { isUnique: false } });

        render(
            <RateInputModal
                show={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialData={null}
            />
        );

        const itemNoInput = screen.getByLabelText(/Item No/i);
        const saveButton = screen.getByRole('button', { name: /Save/i });

        fireEvent.change(itemNoInput, { target: { value: 'NON_UNIQUE_ITEM' } });
        fireEvent.blur(itemNoInput); // Trigger debounce

        expect(saveButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText(/This Item Number already exists!/i)).toBeInTheDocument();
            expect(saveButton).toBeDisabled();
        });

        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/rate/check-itemno/NON_UNIQUE_ITEM'));
    });

    it('should enable save button and clear error if item number is unique', async () => {
        axios.get.mockResolvedValueOnce({ data: { isUnique: true } });

        render(
            <RateInputModal
                show={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialData={null}
            />
        );

        const itemNoInput = screen.getByLabelText(/Item No/i);
        const saveButton = screen.getByRole('button', { name: /Save/i });

        fireEvent.change(itemNoInput, { target: { value: 'UNIQUE_ITEM' } });
        fireEvent.blur(itemNoInput); // Trigger debounce

        await waitFor(() => {
            expect(screen.queryByText(/This Item Number already exists!/i)).not.toBeInTheDocument();
            expect(saveButton).not.toBeDisabled();
        });

        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/rate/check-itemno/UNIQUE_ITEM'));
    });

    it('should consider the initial itemNo unique when editing', async () => {
        const initialItem = { _id: '123', itemNo: 'EDIT_ITEM', description: 'Initial Desc', rate: '100' };

        render(
            <RateInputModal
                show={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                initialData={initialItem}
            />
        );

        const itemNoInput = screen.getByLabelText(/Item No/i);
        const saveButton = screen.getByRole('button', { name: /Save/i });

        expect(itemNoInput).toHaveValue('EDIT_ITEM');
        expect(saveButton).not.toBeDisabled();
        expect(screen.queryByText(/This Item Number already exists!/i)).not.toBeInTheDocument();

        // No axios call should be made if itemNo is not changed
        expect(axios.get).not.toHaveBeenCalled();

        // Now, change to a different non-unique item number
        axios.get.mockResolvedValueOnce({ data: { isUnique: false } });
        fireEvent.change(itemNoInput, { target: { value: 'OTHER_NON_UNIQUE' } });
        fireEvent.blur(itemNoInput);

        await waitFor(() => {
            expect(screen.getByText(/This Item Number already exists!/i)).toBeInTheDocument();
            expect(saveButton).toBeDisabled();
        });
    });
});
