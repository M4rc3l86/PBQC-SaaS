'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createEmployeeSchema,
  editEmployeeSchema,
  type CreateEmployeeFormValues,
  type EditEmployeeFormValues,
} from '@/lib/validations/users'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface EmployeeFormPropsBase {
  isSubmitting?: boolean
  canEditRole?: boolean
}

interface CreateFormProps extends EmployeeFormPropsBase {
  mode: 'create'
  defaultValues?: CreateEmployeeFormValues
  onSubmit: (values: CreateEmployeeFormValues) => void | Promise<void>
}

interface EditFormProps extends EmployeeFormPropsBase {
  mode: 'edit'
  defaultValues?: EditEmployeeFormValues
  onSubmit: (values: EditEmployeeFormValues) => void | Promise<void>
}

type EmployeeFormProps = CreateFormProps | EditFormProps

export function EmployeeForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  canEditRole = true,
}: EmployeeFormProps) {
  const schema = mode === 'create' ? createEmployeeSchema : editEmployeeSchema

  const form = useForm<CreateEmployeeFormValues | EditEmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      fullName: '',
      email: '',
      role: mode === 'create' ? 'employee' : 'admin',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values as never))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voller Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Max Mustermann"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@firma.de"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === 'edit' && canEditRole && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rolle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value as string}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employee">Mitarbeiter</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Wird erstellt...' : 'Wird gespeichert...'}
              </>
            ) : (
              <>{mode === 'create' ? 'Mitarbeiter erstellen' : 'Änderungen speichern'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
