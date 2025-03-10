import { ethers } from 'ethers';
import { sonicBlazeTestnet } from '@/config/chains';

// Interface for document attestation
export interface DocumentAttestation {
  id: string;
  name: string;
  description?: string;
  documentHash: string;
  timestamp: string;
}

// Local storage key for attestations
const ATTESTATIONS_STORAGE_KEY = 'quasar_attestations';

/**
 * Save attestation to local storage
 * @param attestation The attestation to save
 */
export const saveAttestation = (attestation: DocumentAttestation): void => {
  try {
    // Get existing attestations
    const existingAttestations = getAttestations();
    
    // Add new attestation
    existingAttestations.push(attestation);
    
    // Save to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(ATTESTATIONS_STORAGE_KEY, JSON.stringify(existingAttestations));
    }
  } catch (error) {
    console.error('Error saving attestation:', error);
  }
};

/**
 * Get all attestations from local storage
 * @returns Array of attestations
 */
export const getAttestations = (): DocumentAttestation[] => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const attestationsJson = localStorage.getItem(ATTESTATIONS_STORAGE_KEY);
    return attestationsJson ? JSON.parse(attestationsJson) : [];
  } catch (error) {
    console.error('Error getting attestations:', error);
    return [];
  }
};

/**
 * Get attestation by ID
 * @param id Attestation ID
 * @returns Attestation or null if not found
 */
export const getAttestationById = (id: string): DocumentAttestation | null => {
  try {
    const attestations = getAttestations();
    return attestations.find(a => a.id === id) || null;
  } catch (error) {
    console.error('Error getting attestation by ID:', error);
    return null;
  }
};

/**
 * Delete attestation by ID
 * @param id Attestation ID
 * @returns True if successful, false otherwise
 */
export const deleteAttestation = (id: string): boolean => {
  try {
    const attestations = getAttestations();
    const filteredAttestations = attestations.filter(a => a.id !== id);
    
    if (filteredAttestations.length < attestations.length) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ATTESTATIONS_STORAGE_KEY, JSON.stringify(filteredAttestations));
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting attestation:', error);
    return false;
  }
};

/**
 * Generate a document hash
 * @param fileContent File content as Uint8Array
 * @returns Document hash
 */
export const generateDocumentHash = (fileContent: Uint8Array): string => {
  return ethers.utils.keccak256(fileContent);
}; 