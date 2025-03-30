import { loadFromStorage, saveToStorage, clearStorage, STORAGE_KEY } from '../../src/lib/StorageService';
import { initialFormData, initialSections, initialTemplateId } from '../../src/lib/DataInitializer';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('loadFromStorage', () => {
    it('should return initial data when no data exists in localStorage', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValueOnce(null);

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result).toEqual({
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return parsed data from localStorage when it exists', () => {
      // Arrange
      const mockData = {
        formData: { 
          personalInfo: { name: 'Test User', contact0: 'test@email.com', contact1: '', contact2: '', contact3: '', summary: 'Test summary' },
          experience: [{ title: 'Developer', company: 'Test Co', start: '2020', end: '2023', accomplishments: 'Did stuff' }],
          education: [],
          skills: []
        },
        sections: [
          { id: 'test-section', displayName: 'Test Section', href: '/test', selected: true, originalOrder: 0, sortOrder: 0, required: true, sortable: true }
        ],
        templateId: initialTemplateId
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockData));

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result).toEqual(mockData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return initial data if localStorage throws an error', () => {
      // Arrange
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result).toEqual({
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      });
      expect(consoleSpy).toHaveBeenCalledWith('Error loading data from localStorage:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should return initial data for missing properties', () => {
      // Arrange
      const mockData = { formData: null, sections: null };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockData));

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result).toEqual({
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      });
    });
  });

  describe('saveToStorage', () => {
    it('should save data to localStorage', () => {
      // Arrange
      const mockData = {
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      };

      // Act
      saveToStorage(mockData);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(mockData)
      );
    });

    it('should log error when localStorage throws', () => {
      // Arrange
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockData = {
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      };

      // Act
      saveToStorage(mockData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error saving data to localStorage:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    it('should remove data from localStorage and return initial data', () => {
      // Arrange
      // Set some data first
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({
        formData: { personalInfo: { name: 'Test' } },
        sections: []
      }));

      // Act
      const result = clearStorage();

      // Assert
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual({
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      });
    });

    it('should log error when localStorage throws and still return initial data', () => {
      // Arrange
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = clearStorage();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error clearing localStorage:', expect.any(Error));
      expect(result).toEqual({
        formData: initialFormData,
        sections: initialSections,
        templateId: initialTemplateId
      });
      consoleSpy.mockRestore();
    });
  });
});