import NeoCover from './NeoCover'
import EditorialCover from './EditorialCover'
import GeometricCover from './GeometricCover'
import NeumoCover from './NeumoCover'

export default function Cover({ template, s, w, h }) {
  if (template === 'editorial') {
    return <EditorialCover s={s} w={w} h={h} />
  }
  if (template === 'geometric') {
    return <GeometricCover s={s} w={w} h={h} />
  }
  if (template === 'neumo') {
    return <NeumoCover s={s} w={w} h={h} />
  }
  return <NeoCover s={s} w={w} h={h} />
}