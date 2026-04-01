export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  export const isRishihoodEmail = (email: string): boolean => {
    return email.endsWith('rishihood.edu.in') ||
      email.endsWith('@nst.rishihood.edu.in')
  }
  
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const sanitizeProfileLinks = (links: {
    githubUrl?: string
    linkedinUrl?: string
    resumeUrl?: string
  }) => {
    const result: typeof links = {}
    if (links.githubUrl) {
      result.githubUrl = isValidUrl(links.githubUrl) ? links.githubUrl : undefined
    }
    if (links.linkedinUrl) {
      result.linkedinUrl = isValidUrl(links.linkedinUrl) ? links.linkedinUrl : undefined
    }
    if (links.resumeUrl) {
      result.resumeUrl = isValidUrl(links.resumeUrl) ? links.resumeUrl : undefined
    }
    return result
  }