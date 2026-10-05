import { useCreateTaskMutation } from "@/api/Task/apiTask";
import { IChecklist, ITask } from "@/types/taskTypes";
import { Button, Input } from "antd";
import React, { useState } from "react";
import { useTranslations } from "next-intl";


interface AddAndUpdateTaskProps {
  checklist: IChecklist;
  disabled?: boolean;
}

const AddAndUpdateTask: React.FC<AddAndUpdateTaskProps> = ({ checklist, disabled }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [createTask, { isLoading: isLoadingCreate }] = useCreateTaskMutation();
  const t: any = useTranslations();

  const startAdding = () => {
    setIsAdding(true);
  };

  const saveNewTask = async () => {
    const body = {
      name: newTaskName,
      checklist: checklist.id,
      user_ids: [],
    };

    try {
      const result = await createTask(body);

      // Check if 'data' is in the response object to assure TypeScript that we're handling the potential error
      if ("data" in result && result.data) {
        setNewTaskName("");
        setIsAdding(false);
      } else if ("error" in result) {
        console.error("Failed to create task:", result.error);
        // Handle error (e.g., show an error message)
      }
    } catch (error) {
      console.error("Unexpected error when creating task:", error);
      // Handle unexpected errors (e.g., network issues)
    }
  };

  return (
    <div className="mt-3">
      {isAdding ? (
        <>
          <Input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder={t('general.theNameOftheJob')}
            className="mb-2 ml-2"
            disabled={disabled}
          />
          <Button onClick={saveNewTask} className="ml-2" type="primary" loading={isLoadingCreate} disabled={disabled}>
            {t('general.saveWork')}
          </Button>
          <Button danger onClick={() => setIsAdding(false)} className="ml-2" disabled={disabled}>
            {t('general.cancel')}
          </Button>
        </>
      ) : (
        <Button onClick={startAdding} disabled={disabled}>{t('noficationAddAndUpdate.moreWork')}</Button>
      )}
    </div>
  );
};

export default AddAndUpdateTask;
