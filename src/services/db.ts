import { supabase } from '@/lib/supabase/client'
import { Demonstrativos } from '@/stores/use-onboarding-store'

export const saveDiagnostico = async (
  userId: string,
  nomeEmpresa: string,
  dados: Demonstrativos,
  planoAcao: any = null,
) => {
  let { data: empresas, error: empErr } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  let empresaId
  if (empErr) throw empErr

  if (!empresas || empresas.length === 0) {
    const { data: newEmpresa, error: createEmpErr } = await supabase
      .from('empresas')
      .insert({
        user_id: userId,
        nome_empresa: nomeEmpresa || 'Minha Empresa',
      })
      .select('id')
      .single()

    if (createEmpErr) throw createEmpErr
    empresaId = newEmpresa.id
  } else {
    empresaId = empresas[0].id
  }

  const { data: newDiag, error: diagErr } = await supabase
    .from('diagnosticos')
    .insert({
      user_id: userId,
      empresa_id: empresaId,
      dados: dados as any,
      plano_acao: planoAcao,
    })
    .select('id')
    .single()

  if (diagErr) throw diagErr

  return newDiag
}

export const getLatestDiagnostico = async (userId: string) => {
  const { data, error } = await supabase
    .from('diagnosticos')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const getAcompanhamentos = async (userId: string) => {
  const { data, error } = await supabase
    .from('acompanhamentos')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: true })

  if (error) throw error
  return data
}
