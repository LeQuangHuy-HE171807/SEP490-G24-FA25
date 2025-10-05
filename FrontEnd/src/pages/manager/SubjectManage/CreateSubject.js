import React from "react";
import ManagerLayout from "../../layouts/manager-layout";
import SubjectForm from "./SubjectForm";

export default function CreateSubject() {
  return (
    <ManagerLayout>
      <SubjectForm mode="create" />
    </ManagerLayout>
  );
}