import React from 'react';
import Input from '../../components/Input';
import Textbox from '../../components/Textbox';
import { PersonalInfo as PersonalInfoData } from '../../types';
import Button from '../../components/Button';

interface PersonalInfoProps {
  personalInfo: PersonalInfoData;
  handleChange: (section: string, field: string, value: any) => void;
}

function PersonalInfo({ personalInfo, handleChange }: PersonalInfoProps) {
  const addContact = () => {
    const newContacts = [...(personalInfo.contacts || []), ''];
    handleChange('personalInfo', 'contacts', newContacts);
  };

  const removeContact = (index: number) => {
    const newContacts = personalInfo.contacts.filter((_, i) => i !== index);
    handleChange('personalInfo', 'contacts', newContacts);
  };

  const updateContact = (index: number, value: string) => {
    const newContacts = [...personalInfo.contacts];
    newContacts[index] = value;
    handleChange('personalInfo', 'contacts', newContacts);
  };

  return (
    <>
      <div className="flex items-center -mt-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" id="personalInfo">About You</h2>
      </div>
      <p className="hidden text-slate-800 mb-4 dark:text-gray-200 mb-3 w-2/3">
        Tell us about yourself. Your edits will be visible in the preview panel as you type.
      </p>

      <Input 
        type="text" 
        label="Name" 
        formData={{ id: "name", name: "name", value: personalInfo.name}} 
        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('personalInfo', 'name', e.target.value)} 
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contacts</h3>
          <Button
            theme="interaction"
            onClick={addContact}
            text="Add Contact"
          />
        </div>
        
        {(personalInfo.contacts || []).map((contact, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input 
              type="text" 
              label={`Contact #${index + 1}`}
              formData={{ 
                id: `contact${index}`, 
                name: `contact${index}`, 
                value: contact 
              }} 
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(index, e.target.value)} 
            />
            <Button
              theme="danger"
              onClick={() => removeContact(index)}
              className="mt-6"
              text="Remove"
            />
          </div>
        ))}
      </div>

      <Textbox 
        rows={3} 
        label={"Summary (optional)"} 
        formData={{ id: "summary", name: "summary", value: personalInfo.summary }} 
        handleChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('personalInfo', 'summary', e.target.value)} 
      />
    </>
  );
}

export default PersonalInfo;