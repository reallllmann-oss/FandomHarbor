export const WORK_TITLE_MIN_LENGTH = 1;
export const WORK_TITLE_MAX_LENGTH = 300;
export const WORK_DESCRIPTION_MAX_LENGTH = 5000;

const illegalTitleCharacters = /[\u0000-\u001f\u007f]/u;

export interface WorkFormValues {
  category: string;
  description: string;
  tags: string[];
  title: string;
}

export interface WorkFormErrors {
  description?: string;
  title?: string;
}

export const EMPTY_WORK_FORM_VALUES: WorkFormValues = {
  category: "",
  description: "",
  tags: [],
  title: "",
};

export function validateWorkForm(values: WorkFormValues): WorkFormErrors {
  const errors: WorkFormErrors = {};
  const title = values.title.trim();

  if (title.length < WORK_TITLE_MIN_LENGTH) {
    errors.title = "请输入作品标题。";
  } else if (values.title.length > WORK_TITLE_MAX_LENGTH) {
    errors.title = `作品标题不能超过 ${WORK_TITLE_MAX_LENGTH} 个字符。`;
  } else if (illegalTitleCharacters.test(values.title)) {
    errors.title = "作品标题包含不可使用的控制字符。";
  }

  if (values.description.length > WORK_DESCRIPTION_MAX_LENGTH) {
    errors.description = `作品简介不能超过 ${WORK_DESCRIPTION_MAX_LENGTH} 个字符。`;
  }

  return errors;
}
