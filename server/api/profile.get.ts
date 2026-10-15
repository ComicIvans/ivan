import { fetchProfile } from '~~/server/utils/profile'

export default defineEventHandler((event) => fetchProfile(event))
