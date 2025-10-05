import React from "react";
import { useParams } from "react-router-dom";
import ManagerLayout from "../../layouts/manager-layout";
import SubjectForm from "./SubjectForm";

export default function EditSubject() {
  const { subjectId } = useParams();

  return (
    <ManagerLayout>
      <SubjectForm mode="edit" subjectId={parseInt(subjectId)} />
    </ManagerLayout>
  );
}