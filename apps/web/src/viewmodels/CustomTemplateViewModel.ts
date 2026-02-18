import { useState, useCallback, useEffect } from "react";
import type { ICustomTemplateService } from "../services";
import type { Template } from "@repo/core";

export interface CustomTemplateViewModelValue {
  customTemplates: Template[];
  saveTemplate: (name: string, code: string) => void;
  deleteTemplate: (name: string) => void;
}

export function useCustomTemplateViewModel(
  service: ICustomTemplateService,
): CustomTemplateViewModelValue {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  useEffect(() => {
    setCustomTemplates(service.getTemplates());
  }, [service]);

  const saveTemplate = useCallback((name: string, code: string) => {
    service.addTemplate({ name, category: "My Templates", code });
    setCustomTemplates(service.getTemplates());
  }, [service]);

  const deleteTemplate = useCallback((name: string) => {
    service.deleteTemplate(name);
    setCustomTemplates(service.getTemplates());
  }, [service]);

  return { customTemplates, saveTemplate, deleteTemplate };
}
