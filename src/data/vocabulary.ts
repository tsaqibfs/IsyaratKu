import activeModel from '../../ml/configs/active-model.json'

const packages = import.meta.glob<string[]>('../../web-models/*/labels.json', { eager: true, import: 'default' })

// Reuse the active package; the guide does not create a separate supported-word list.
export const vocabulary = packages[`../../web-models/${activeModel.modelId}/labels.json`] ?? []
