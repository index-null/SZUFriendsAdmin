<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑班级' : '新增班级'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="form"
    >
      <el-form-item label="班级名称" prop="className">
        <el-input
          v-model="formData.className"
          placeholder="请输入班级名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="所属学院" prop="collegeId">
        <el-select
          v-model="formData.collegeId"
          placeholder="请选择学院"
          style="width: 100%"
          :disabled="!isAdmin && collegeLeaderId > 0"
        >
          <el-option
            v-for="college in collegeList"
            :key="college.id"
            :label="college.collegeName"
            :value="college.id"
          />
        </el-select>
        <div v-if="!isAdmin && collegeLeaderId > 0" class="form-tip">
          您只能管理本学院的班级
        </div>
      </el-form-item>

      <el-form-item label="年级" prop="grade">
        <el-input-number
          v-model="formData.grade"
          :min="2000"
          :max="2030"
          controls-position="right"
          style="width: 100%"
          placeholder="如：2020"
        />
      </el-form-item>

      <el-form-item label="专业" prop="major">
        <el-input v-model="formData.major" placeholder="请输入专业" clearable />
      </el-form-item>

      <el-form-item label="班级类型" prop="classType">
        <el-select
          v-model="formData.classType"
          placeholder="请选择班级类型"
          style="width: 100%"
        >
          <el-option label="本科" :value="1" />
          <el-option label="硕士" :value="2" />
          <el-option label="博士" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="成员数量" prop="memberCount">
        <el-input-number
          v-model="formData.memberCount"
          :min="0"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="班级简介" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入班级简介"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="班级封面图" prop="coverImage">
        <el-input
          v-model="formData.coverImage"
          placeholder="请输入班级封面图URL"
          clearable
        />
      </el-form-item>

      <el-form-item label="班级公告" prop="notice">
        <el-input
          v-model="formData.notice"
          type="textarea"
          placeholder="请输入班级公告"
          :rows="3"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { ClassEntity } from '@/api/modules/class'
import type { CollegeEntity } from '@/api/modules/college'

interface Props {
  visible: boolean
  data?: ClassEntity | null
  collegeLeaderId?: number
  isAdmin?: boolean
  collegeList?: CollegeEntity[]
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  collegeLeaderId: 0,
  isAdmin: false,
  collegeList: () => [],
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  success: [data: ClassEntity]
}>()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = ref(false)

const formData = reactive<ClassEntity>({
  className: '',
  collegeId: 0,
  memberCount: 0,
  status: 1,
  grade: undefined,
  major: '',
  classType: undefined,
  description: '',
  coverImage: '',
  notice: '',
})

const formRules: FormRules = {
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  collegeId: [{ required: true, message: '请选择学院', trigger: 'change' }],
  memberCount: [{ required: true, message: '请输入成员数量', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  classType: [{ required: true, message: '请选择班级类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    className: '',
    collegeId: props.collegeLeaderId || 0,
    memberCount: 0,
    status: 1,
    grade: undefined,
    major: '',
    classType: undefined,
    description: '',
    coverImage: '',
    notice: '',
  })
  isEdit.value = false
}

const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    emit('success', { ...formData })
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}

// 监听 visible 变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val && props.data) {
      // 编辑模式，填充数据
      Object.assign(formData, props.data)
      isEdit.value = true

      // 确保所有必需字段都有值
      if (formData.memberCount === undefined) formData.memberCount = 0
      if (formData.grade === undefined)
        formData.grade = new Date().getFullYear()
      if (formData.major === undefined) formData.major = ''
      if (formData.classType === undefined) formData.classType = 1
      if (formData.description === undefined) formData.description = ''
      if (formData.coverImage === undefined) formData.coverImage = ''
      if (formData.notice === undefined) formData.notice = ''

      // 非管理员且有 collegeLeaderId 时，不能修改学院
      if (
        !props.isAdmin &&
        props.collegeLeaderId &&
        props.collegeLeaderId > 0
      ) {
        formData.collegeId = props.collegeLeaderId
      }
    } else if (val) {
      // 新增模式，重置表单
      resetForm()

      // 非管理员且有 collegeLeaderId 时，设置默认学院
      if (
        !props.isAdmin &&
        props.collegeLeaderId &&
        props.collegeLeaderId > 0
      ) {
        formData.collegeId = props.collegeLeaderId
      }
    }
  },
  { immediate: true },
)

// 监听内部 visible 变化，同步到外部
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})
</script>

<style scoped>
.form {
  padding-right: 20px;
}

.form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
