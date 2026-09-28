import { describe, expect, it } from 'vitest'
import {
  MENU_BY_ROLE,
  menuProfile,
  ORGANIZATION_SECTIONS,
  registerSections,
} from '@/lib/domain/sections'
import { ROLE_LABELS } from '@/lib/domain/roles'

/**
 * La barre range, elle n'ouvre ni ne ferme aucun droit. Ces tests tiennent la
 * regle : AUCUNE section ne disparait, quel que soit le role — sinon un lien
 * partage conduirait a un menu qui pretend que la page n'existe pas.
 */
const TOUTES = ORGANIZATION_SECTIONS.map((s) => s.key)

describe('Menu par rôle', () => {
  it('chaque rôle attribué a son profil', () => {
    const roles = Object.keys(ROLE_LABELS)
    expect(roles.filter((r) => !MENU_BY_ROLE[r])).toEqual([])
  })

  it('aucune section n’est retirée, quel que soit le rôle', () => {
    for (const role of Object.keys(MENU_BY_ROLE)) {
      const profile = menuProfile(role)
      const vues = [...profile.primary, ...registerSections(profile)].sort()
      expect(`${role}: ${vues.join(',')}`).toBe(`${role}: ${[...TOUTES].sort().join(',')}`)
    }
  })

  it('une section en première ligne n’est jamais muette : on ne met pas en avant ce qu’on tait', () => {
    for (const role of Object.keys(MENU_BY_ROLE)) {
      const profile = menuProfile(role)
      // L'auditeur fait exception, et c'est le sens de son rôle : il constate,
      // il ne solde rien. Tout est muet chez lui, première ligne comprise.
      if (role === 'auditor') continue
      const contradiction = profile.primary.filter((k) => profile.muted.includes(k))
      expect(`${role}: ${contradiction.join(',')}`).toBe(`${role}: `)
    }
  })

  it('un rôle inconnu ne présume rien : les deux sections de travail', () => {
    expect(menuProfile(null).primary).toEqual(['apercu', 'processus'])
    expect(menuProfile('inexistant').muted).toEqual([])
  })

  it('ceux qui lisent un portefeuille l’ouvrent en premier', () => {
    expect(menuProfile('executive_viewer').pilotageFirst).toBe(true)
    expect(menuProfile('auditor').pilotageFirst).toBe(true)
    expect(menuProfile('governance_officer').pilotageFirst).toBeUndefined()
  })

  it('l’auditeur ne porte aucune pastille', () => {
    expect([...menuProfile('auditor').muted].sort()).toEqual([...TOUTES].sort())
  })
})
