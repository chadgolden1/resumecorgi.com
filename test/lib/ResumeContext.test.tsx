import { render, screen, act } from '@testing-library/react';
import { ResumeProvider, useResume } from '@/lib/ResumeContext';
import { loadFromStorage, saveToStorage } from '@/lib/StorageService';
import { TemplateFactory } from '@/lib/LaTeX/TemplateFactory';

jest.mock('@/lib/StorageService', () => ({
  loadFromStorage: jest.fn(),
  saveToStorage: jest.fn(),
}));

jest.mock('@/lib/LaTeX/TemplateFactory', () => ({
  TemplateFactory: {
    getAvailableTemplates: jest.fn(),
  },
}));

const TestComponent = () => {
  const {
    formData,
    sections,
    selectedTemplate,
    handleChange,
    handleSectionSelected,
    handleSectionRemoved,
    handleMoveTo,
    addGenericSection,
  } = useResume();

  return (
    <div>
      <div data-testid="form-data">{JSON.stringify(formData)}</div>
      <div data-testid="sections">{JSON.stringify(sections)}</div>
      <div data-testid="template">{JSON.stringify(selectedTemplate)}</div>
      <button
        data-testid="change-button"
        onClick={() => handleChange('personal', 'name', 'Test User')}
      >
        Change Name
      </button>
      <button
        data-testid="toggle-section"
        onClick={() => handleSectionSelected('education', false)}
      >
        Toggle Section
      </button>
      <button
        data-testid="remove-section"
        onClick={() => handleSectionRemoved('skills')}
      >
        Remove Section
      </button>
      <button
        data-testid="move-section"
        onClick={() => handleMoveTo(1, 0)}
      >
        Move Section
      </button>
      <button
        data-testid="add-section"
        onClick={addGenericSection}
      >
        Add Section
      </button>
    </div>
  );
};

describe('ResumeContext', () => {
  const mockTemplates = [
    { id: 'template1', name: 'Template 1', description: 'Test template 1' },
    { id: 'template2', name: 'Template 2', description: 'Test template 2' },
  ];

  const mockFormData = {
    personal: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    education: {
      degrees: ['Bachelor of Science'],
    },
    genericSections: {
      'genericSection0': {
        title: 'Custom Section',
        items: []
      }
    }
  };

  const mockSections = [
    {
      id: 'personal',
      displayName: 'Personal Information',
      href: '#personal',
      selected: true,
      originalOrder: 0,
      sortOrder: 0,
      required: true,
      sortable: true,
      removeable: false,
    },
    {
      id: 'education',
      displayName: 'Education',
      href: '#education',
      selected: true,
      originalOrder: 1,
      sortOrder: 1,
      required: false,
      sortable: true,
      removeable: false,
    },
    {
      id: 'skills',
      displayName: 'Skills',
      href: '#skills',
      selected: true,
      originalOrder: 2,
      sortOrder: 2,
      required: false,
      sortable: true,
      removeable: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (loadFromStorage as jest.Mock).mockReturnValue({
      formData: mockFormData,
      sections: mockSections,
      templateId: 'template1',
    });

    (TemplateFactory.getAvailableTemplates as jest.Mock).mockReturnValue(mockTemplates);
  });

  it('initializes with data from storage', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const formDataEl = screen.getByTestId('form-data');
    const sectionsEl = screen.getByTestId('sections');
    const templateEl = screen.getByTestId('template');
    
    expect(JSON.parse(formDataEl.textContent!)).toEqual(mockFormData);
    expect(JSON.parse(sectionsEl.textContent!)).toEqual(mockSections);
    expect(JSON.parse(templateEl.textContent!)).toEqual(mockTemplates[0]);
  });

  it('uses the first available template if saved template not found', () => {
    (loadFromStorage as jest.Mock).mockReturnValue({
      formData: mockFormData,
      sections: mockSections,
      templateId: 'non-existent-template',
    });

    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const templateEl = screen.getByTestId('template');
    expect(JSON.parse(templateEl.textContent!)).toEqual(mockTemplates[0]);
  });

  it('throws an error when useResume is used outside of ResumeProvider', () => {
    // Silence error logs during this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useResume must be used within a ResumeProvider');
    
    console.error = originalError;
  });

  it('updates form data via handleChange', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const changeButton = screen.getByTestId('change-button');
    act(() => {
      changeButton.click();
    });
    
    const formDataEl = screen.getByTestId('form-data');
    const updatedFormData = JSON.parse(formDataEl.textContent!);
    
    expect(updatedFormData.personal.name).toBe('Test User');
    expect(saveToStorage).toHaveBeenCalled();
  });

  it('toggles section selection', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle-section');
    act(() => {
      toggleButton.click();
    });
    
    const sectionsEl = screen.getByTestId('sections');
    const updatedSections = JSON.parse(sectionsEl.textContent!);
    
    const educationSection = updatedSections.find((s: any) => s.id === 'education');
    expect(educationSection.selected).toBe(false);
    expect(saveToStorage).toHaveBeenCalled();
  });

  it('removes a section', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const removeButton = screen.getByTestId('remove-section');
    act(() => {
      removeButton.click();
    });
    
    const sectionsEl = screen.getByTestId('sections');
    const updatedSections = JSON.parse(sectionsEl.textContent!);
    
    expect(updatedSections.length).toBe(2);
    expect(updatedSections.find((s: any) => s.id === 'skills')).toBeUndefined();
    expect(saveToStorage).toHaveBeenCalled();
  });

  it('reorders sections', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const moveButton = screen.getByTestId('move-section');
    act(() => {
      moveButton.click();
    });
    
    const sectionsEl = screen.getByTestId('sections');
    const updatedSections = JSON.parse(sectionsEl.textContent!);
    
    expect(updatedSections[0].id).toBe('education');
    expect(updatedSections[1].id).toBe('personal');
    
    // Check that sort orders are updated
    expect(updatedSections[0].sortOrder).toBe(0);
    expect(updatedSections[1].sortOrder).toBe(1);
    expect(saveToStorage).toHaveBeenCalled();
  });

  it('adds a new generic section', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    const addButton = screen.getByTestId('add-section');
    act(() => {
      addButton.click();
    });
    
    const formDataEl = screen.getByTestId('form-data');
    const sectionsEl = screen.getByTestId('sections');
    
    const updatedFormData = JSON.parse(formDataEl.textContent!);
    const updatedSections = JSON.parse(sectionsEl.textContent!);
    
    // Check if a new generic section was added to formData
    expect(updatedFormData.genericSections.genericSection1).toBeDefined();
    expect(updatedFormData.genericSections.genericSection1.title).toBe('New Section');
    
    // Check if a new section was added to sections
    expect(updatedSections.length).toBe(4);
    const newSection = updatedSections.find((s: any) => s.id === 'genericSection1');
    expect(newSection).toBeDefined();
    expect(newSection.displayName).toBe('New Section');
    expect(newSection.selected).toBe(true);
    expect(saveToStorage).toHaveBeenCalled();
  });

  it('persists data to storage when state changes', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );
    
    // Initial render should trigger a save
    expect(saveToStorage).toHaveBeenCalledTimes(1);
    
    const changeButton = screen.getByTestId('change-button');
    act(() => {
      changeButton.click();
    });
    
    // Should save again
    expect(saveToStorage).toHaveBeenCalledTimes(2);
    
    // Get the most recent call arguments
    const lastCallArgs = (saveToStorage as jest.Mock).mock.calls.slice(-1)[0][0];
    
    // Verify correct data is being saved
    expect(lastCallArgs).toMatchObject({
      formData: expect.any(Object),
      sections: expect.any(Array),
      templateId: 'template1'
    });
    
    expect(lastCallArgs.formData.personal.name).toBe('Test User');
  });
});