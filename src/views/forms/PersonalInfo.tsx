import React from 'react';
import Input from '../../components/Input';
import Textbox from '../../components/Textbox';
import { PersonalInfo as PersonalInfoData, FormData } from '../../types';
import Button from '../../components/Button';
import { useResume } from '@/context/ResumeContext';

function PersonalInfo() {
  const { formData, handleChange } = useResume();
  const personalInfo = formData.personalInfo;

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

      <div className="space-y-5">
        <div className={ personalInfo.contacts?.length || 0 > 0 ? "mb-3" : "mb-1" }>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Contact Information</h3>
        </div>

        <div className={ personalInfo.contacts?.length || 0 > 0 ? "mb-3" : "mb-0" }>
          {(personalInfo.contacts || []).map((contact, index) => (
            <div key={index} className="flex items-center gap-2 mb-0 w-full border-l-3 border-l-gray-200 dark:border-l-zinc-700">
              <Input
                containerClassName="ms-3 w-full"
                type="text" 
                label={`Contact #${index + 1}`}
                formData={{ 
                  id: `contact${index}`, 
                  name: `contact${index}`, 
                  value: contact 
                }} 
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContact(index, e.target.value)} 
              />
              <span className="relative top-[6px]">
                <Button
                  theme="danger"
                  onClick={() => removeContact(index)}
                  className="text-sm py-2"
                  text="Remove"
                />
              </span>
            </div>
          ))}
        </div>

        <div className="mb-4" hidden={(personalInfo.contacts?.length || 0) >= 6}>
          <Button
              theme="success"
              className="text-sm"
              onClick={addContact}
              text="Add Contact"
            />
        </div>
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