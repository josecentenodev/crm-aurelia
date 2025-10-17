import { Step2CamposDinamicos } from './Step2CamposDinamicos';
import type { AgentTemplate } from '@/domain/Agentes';
import type { AgentFormValues } from './Step2CamposDinamicos';

interface AgentSettingsFormProps {
  template: AgentTemplate;
  values: AgentFormValues;
  setValues: (updater: (prev: AgentFormValues) => AgentFormValues) => void;
}

export default function AgentSettingsForm({ template, values, setValues }: AgentSettingsFormProps) {
  return (
    <Step2CamposDinamicos template={template} values={values} setValues={setValues} />
  );
} 