interface PasswordStrengthIndicatorProps {
  password: string
}

function getPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('At least 8 characters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('One uppercase letter')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('One lowercase letter')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('One number')
  }

  return { score, feedback }
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { score, feedback } = getPasswordStrength(password)

  const getStrengthColor = () => {
    if (score <= 1) return 'bg-red-500'
    if (score === 2) return 'bg-orange-500'
    if (score === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (score <= 1) return 'Weak'
    if (score === 2) return 'Fair'
    if (score === 3) return 'Good'
    return 'Strong'
  }

  const getStrengthWidth = () => {
    return `${(score / 4) * 100}%`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          Password strength
        </span>
        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
          {getStrengthText()}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: getStrengthWidth() }}
        />
      </div>

      {feedback.length > 0 && (
        <ul className="space-y-1">
          {feedback.map((item) => (
            <li
              key={item}
              className="text-xs text-zinc-600 dark:text-zinc-400"
            >
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
