import type { Metadata } from "next";

import { pageMetadata } from "../../lib/seo";
import {
  BulletList,
  ContactLink,
  NumberedList,
  PolicyParagraph,
  PolicySection,
  PolicySubsection,
  PublicPolicyPage,
} from "../_components/public-policy";

export const metadata: Metadata = pageMetadata({
  description:
    "Fandom Harbor V1 关于成熟题材、禁止内容、内容治理、举报与下架请求的内容政策。",
  pathname: "/content-policy",
  title: "Content Policy",
});

// Canonical source: docs/19_Release/V1-PUBLIC-POLICY-V1.0.md, section 4.
export default function ContentPolicyPage() {
  return (
    <PublicPolicyPage
      description="本页说明 Fandom Harbor V1 对成熟题材、禁止内容与行为、内容治理、举报、侵权投诉和下架请求的规则。"
      title="Content Policy"
    >
      <PolicySection id="mature-content" title="1. 成人题材与敏感内容">
        <PolicyParagraph>
          Fandom Harbor 仅面向年满 18 周岁的受邀用户。
        </PolicyParagraph>
        <PolicyParagraph>
          平台允许发布符合法律和本 Content Policy
          的成人题材。成人题材不表示可以发布违法、剥削、非自愿、侵犯隐私或涉及未成年人的禁止内容。
        </PolicyParagraph>
        <p className="text-base font-semibold leading-8 text-foreground">
          严格禁止：
        </p>
        <NumberedList>
          <li>涉及未成年人的性内容；</li>
          <li>对未成年人的性剥削或诱导；</li>
          <li>将未成年人置于色情或性化场景；</li>
          <li>其他违反适用法律或平台安全边界的相关内容。</li>
        </NumberedList>
        <PolicyParagraph>
          不得以“虚构”“同人”“角色年龄模糊”或类似表述规避未成年人保护限制。
        </PolicyParagraph>
        <PolicyParagraph>
          Fandom Harbor
          运营方仍可根据法律要求、安全风险、投诉情况和本政策，限制访问、取消公开、归档或通过受控流程删除相关内容。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="real-persons" title="2. 真实人物与隐私">
        <PolicyParagraph>
          不得未经授权公开真实人物的敏感个人信息，包括但不限于家庭住址、电话号码、身份文件、金融信息、精确私人位置、非公开联系方式，以及其他可能造成现实伤害的隐私信息。
        </PolicyParagraph>
        <PolicyParagraph>
          涉及真实人物的内容不得包含威胁、骚扰、恶意曝光隐私、欺骗冒充或其他明显侵害行为。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="prohibited" title="3. 其他禁止内容与行为">
        <PolicyParagraph>
          Fandom Harbor V1 同时禁止发布、传播或协助以下内容或行为：
        </PolicyParagraph>
        <BulletList>
          <li>违法内容；</li>
          <li>涉及未成年人的性内容；</li>
          <li>非自愿性内容或性暴力剥削内容；</li>
          <li>真实威胁；</li>
          <li>骚扰和恶意曝光隐私；</li>
          <li>欺诈或恶意冒充；</li>
          <li>明确侵犯他人隐私的内容；</li>
          <li>恶意软件或危险欺骗链接；</li>
          <li>侵犯知识产权且在有效通知后拒不处理的内容；</li>
          <li>其他违反本 Content Policy 和适用法律的内容。</li>
        </BulletList>
        <PolicyParagraph>
          这些规则用于处理具体安全、权利和违法风险，不构成含义不清、可任意解释的一般性思想审查。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="governance" title="4. 治理、举报与侵权投诉">
        <PolicyParagraph>
          Fandom Harbor
          进行人工审核，并可根据情况要求补充信息、暂时限制访问、隐藏、下架、删除内容，或限制、终止账号。平台会提供合理的解释或申诉机会；存在紧急安全风险时，可以先采取临时措施。
        </PolicyParagraph>
        <PolicyParagraph>
          举报人或受影响用户可以发送邮件至 <ContactLink />
          ，并尽量提供作品名称、相关链接、问题说明以及可核对的材料。请勿在邮件中发送密码、Cookie、Token
          或 Session。
        </PolicyParagraph>
        <PolicyParagraph>
          当前采用普通侵权通知和人工内容下架机制。Fandom Harbor
          不宣称已经登记美国 DMCA Agent、建立完整美国 DMCA
          法定通知流程，或保证所有请求均按美国 DMCA
          程序处理；这不表示平台拒绝处理美国权利人提交的合法通知。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="takedown" title="5. 内容下架请求">
        <PolicySubsection title="5.1 提交请求">
          <PolicyParagraph>
            请通过 <ContactLink /> 提交请求，并说明：
          </PolicyParagraph>
          <BulletList>
            <li>请求类型：数据导出、账号或数据删除、内容下架或其他；</li>
            <li>与账号或内容相关的必要识别信息；</li>
            <li>请求范围和原因；</li>
            <li>如适用，可供核对的作品名称、链接或权利证明。</li>
          </BulletList>
          <PolicyParagraph>
            为保护账号和内容安全，我们可能在处理前验证请求人的身份、权限或权利基础。
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="5.2 内容下架">
          <PolicyParagraph>
            Fandom Harbor 运营方负责处理 V1
            下架请求。对存在明显安全、违法、未成年人、侵权或隐私风险的内容，可以先暂停访问、取消公开或归档，再完成核对和后续受控处理。Fandom
            Harbor
            运营方也可以根据违规情况暂停账号访问或通过受控流程删除违规内容。
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>
    </PublicPolicyPage>
  );
}
