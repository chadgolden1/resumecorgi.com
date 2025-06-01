import React from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { FormData, Reference as ReferenceInfo } from '../../types';
import Separator from '../../components/Separator';
import { useResume } from '@/lib/ResumeContext';

function Reference() {
  const { formData, setFormData } = useResume();
  const references = formData.references;

  const addReference = (): void => {
    const newReference: ReferenceInfo = {
      name: '',
      title: '',
      company: '',
      contactEmail: '',
      contactPhone: ''
    };

    setFormData({
      ...formData,
      references: [...references, newReference]
    });
  };

  const removeReference = (index: number): void => {
    const updatedReference = [...references];
    updatedReference.splice(index, 1);
    setFormData({
      ...formData,
      references: updatedReference
    });
  };

  const updateReference = (index: number, field: keyof ReferenceInfo, value: string): void => {
    const updatedReference = { ...references[index], [field]: value };
    const updatedReferences = [...references];
    updatedReferences[index] = updatedReference;
    setFormData({
      ...formData,
      references: updatedReferences
    });
  };

  return (
    <>
      <div className="flex items-center -mt-1 mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="references">References</h2>
      </div>
      <p className="hidden text-slate-800 mb-4 dark:text-gray-200 mb-6 w-2/3">
        Let's add your references.
      </p>

      {references.map((ref, index) => (
        <div key={index} className="mb-3">
          {index !== 0 && index !== references.length && (
            <Separator />
          )}
          <h3 className="text-medium font-bold mb-1.5 text-gray-900 dark:text-gray-200">
            {`Reference #${index + 1}`}
            {index >= 0 && (
              <>
                <span className="ms-3"></span>
                <Button
                  text="Remove"
                  onClick={() => removeReference(index)}
                  parentClassName="mb-1"
                  className="text-sm"
                  theme="danger"
                />
              </>
            )}
          </h3>

          <Input
            type="text"
            label={`Reference #${index + 1} Name`}
            formData={{
              id: `reference-name${index}`,
              name: `reference-name${index}`,
              value: ref.name
            }}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReference(index, 'name', e.target.value)}
          />

          <Input
            type="text"
            label={`Reference #${index + 1} Company`}
            formData={{
              id: `reference-company${index}`,
              name: `reference-company${index}`,
              value: ref.company
            }}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReference(index, 'company', e.target.value)}
          />

          <Input
            type="text"
            label={`Reference #${index + 1} Job Title (optional)`}
            formData={{
              id: `reference-title${index}`,
              name: `reference-title${index}`,
              value: ref.title
            }}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReference(index, 'title', e.target.value)}
          />

          <Input
            type="text"
            label={`Reference #${index + 1} Contact Phone (Optional if Email is provided)`}
            formData={{
              id: `reference-contact-phone${index}`,
              name: `reference-contact-phone${index}`,
              value: ref.contactPhone
            }}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReference(index, 'contactPhone', e.target.value)}
          />

          <Input
            type="text"
            label={`Reference #${index + 1} Contact Email (Optional if Phone is provided)`}
            formData={{
              id: `reference-contact-email${index}`,
              name: `reference-contact-email${index}`,
              value: ref.contactEmail
            }}
            handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateReference(index, 'contactEmail', e.target.value)}
          />
        </div>
      ))}

      <Button
        text={references.length > 0 ? `Add Another Reference` : `Add Reference`}
        theme="success"
        className="text-sm"
        onClick={addReference} />
    </>
  );
}

export default Reference;